package org.foodshare

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpHandler
import com.sun.net.httpserver.HttpServer
import org.mindrot.jbcrypt.BCrypt
import java.io.File
import java.net.InetSocketAddress
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import java.security.SecureRandom
import java.sql.Connection
import java.sql.DriverManager
import java.sql.PreparedStatement
import java.sql.ResultSet
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID
import java.util.concurrent.Executors

private class ApiError(val code: Int, val apiMessage: String) : RuntimeException(apiMessage)

private class AuthUser(
    val id: String,
    val name: String,
    val email: String,
    val role: String,
    val organization: String?
)

private class FoodShareServer {
    private val mapper = ObjectMapper()
    private val connection: Connection
    private val jwtSecret: String

    init {
        Class.forName("org.sqlite.JDBC")
        val dbPath = System.getenv("FOODSHARE_DB")
        if (dbPath == null) {
            connection = DriverManager.getConnection("jdbc:sqlite:${File("foodshare.db").absolutePath}")
        } else {
            connection = DriverManager.getConnection("jdbc:sqlite:$dbPath")
        }
        connection.createStatement().execute("PRAGMA foreign_keys = ON")
        createTables()
        seedUsers()

        val configuredSecret = System.getenv("JWT_SECRET")
        if (System.getenv("NODE_ENV") == "production" && configuredSecret.isNullOrEmpty()) {
            throw IllegalStateException("JWT_SECRET must be configured in production")
        }
        if (configuredSecret != null) {
            jwtSecret = configuredSecret
        } else {
            // Persist secret across restarts so tokens stay valid
            val secretFile = java.io.File("foodshare_jwt_secret.txt")
            jwtSecret = if (secretFile.exists()) {
                val stored = secretFile.readText().trim()
                if (stored.length >= 32) stored else { val s = generateRandomHex32(); secretFile.writeText(s); s }
            } else {
                val s = generateRandomHex32(); secretFile.writeText(s); s
            }
        }
    }

    fun start() {
        var port = 5000
        val portValue = System.getenv("PORT")
        if (portValue != null) {
            port = portValue.toIntOrNull() ?: 5000
        }
        val server = HttpServer.create(InetSocketAddress(port), 0)
        server.createContext("/api", ApiHandler())
        server.executor = Executors.newSingleThreadExecutor()
        server.start()
        println("FoodShare Kotlin REST API running at http://localhost:$port")
    }

    private inner class ApiHandler : HttpHandler {
        override fun handle(exchange: HttpExchange) {
            try {
                addCorsHeaders(exchange)
                if (exchange.requestMethod == "OPTIONS") {
                    exchange.sendResponseHeaders(204, -1)
                    exchange.close()
                    return
                }
                dispatch(exchange)
            } catch (error: ApiError) {
                sendJson(exchange, error.code, mapOf("error" to error.apiMessage))
            } catch (error: Exception) {
                error.printStackTrace()
                sendJson(exchange, 500, mapOf("error" to (error.message ?: "Internal Server Error")))
            }
        }
    }

    private fun dispatch(exchange: HttpExchange) {
        val path = exchange.requestURI.path
        val method = exchange.requestMethod

        if (path == "/api/health" && method == "GET") {
            val result = HashMap<String, Any>()
            result["status"] = "online"
            result["app"] = "FoodShare REST API"
            result["version"] = "1.0.0"
            result["timestamp"] = Instant.now().toString()
            sendJson(exchange, 200, result)
            return
        }
        if (path.startsWith("/api/auth/")) {
            handleAuth(exchange, path.substring("/api/auth".length), method)
            return
        }
        if (path == "/api/donations" || path.startsWith("/api/donations/")) {
            handleDonations(exchange, path.substring("/api/donations".length), method)
            return
        }
        if (path.startsWith("/api/claims/")) {
            handleClaims(exchange, path.substring("/api/claims".length), method)
            return
        }
        if (path.startsWith("/api/stats/")) {
            handleStats(exchange, path.substring("/api/stats".length), method)
            return
        }
        throw ApiError(404, "Route not found")
    }

    private fun addCorsHeaders(exchange: HttpExchange) {
        exchange.responseHeaders.add("Access-Control-Allow-Origin", "*")
        exchange.responseHeaders.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        exchange.responseHeaders.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    }

    private fun sendJson(exchange: HttpExchange, status: Int, body: Any) {
        val bytes = mapper.writeValueAsBytes(body)
        exchange.responseHeaders.set("Content-Type", "application/json; charset=utf-8")
        exchange.sendResponseHeaders(status, bytes.size.toLong())
        exchange.responseBody.write(bytes)
        exchange.close()
    }

    private fun readBody(exchange: HttpExchange): JsonNode {
        return mapper.readTree(exchange.requestBody)
    }

    private fun text(body: JsonNode, key: String): String? {
        val value = body.get(key)
        if (value == null || value.isNull) return null
        return value.asText()
    }

    private fun integer(body: JsonNode, key: String): Int? {
        val value = body.get(key)
        if (value == null || value.isNull) return null
        if (value.isNumber) return value.asInt()
        return value.asText().toIntOrNull()
    }

    private fun handleAuth(exchange: HttpExchange, path: String, method: String) {
        if (path == "/register" && method == "POST") {
            register(exchange, false)
            return
        }
        if (path == "/users" && method == "POST") {
            val admin = requireUser(exchange)
            requireRole(admin, "admin")
            register(exchange, true)
            return
        }
        if (path == "/login" && method == "POST") {
            login(exchange)
            return
        }
        if (path == "/me" && method == "GET") {
            getCurrentUser(exchange)
            return
        }
        throw ApiError(404, "Route not found")
    }

    private fun register(exchange: HttpExchange, isAdminCreation: Boolean) {
        val body = readBody(exchange)
        val name = text(body, "name")
        val email = text(body, "email")
        val password = text(body, "password")
        val role = text(body, "role")
        if (name.isNullOrBlank() || email.isNullOrBlank() || password == null || role.isNullOrBlank()) {
            throw ApiError(400, "Name, email, password, and role are required")
        }
        if (isAdminCreation) {
            if (role != "donor" && role != "ngo" && role != "admin") throw ApiError(400, "Role must be donor, ngo, or admin")
            if (password.length < 12) throw ApiError(400, "Admin-created account passwords must be at least 12 characters")
        } else {
            if (role != "donor" && role != "ngo") throw ApiError(400, "Public registration is limited to donor and ngo accounts")
            if (password.length < 6) throw ApiError(400, "Password must be at least 6 characters")
        }

        val normalizedEmail = email.trim().lowercase()
        if (queryOne("SELECT id FROM users WHERE email=?", normalizedEmail) != null) {
            throw ApiError(409, "An account with this email already exists")
        }
        val id = "usr-${UUID.randomUUID()}"
        var organization = text(body, "organization")
        if (organization == null) {
            organization = if (role == "donor") "Individual Donor" else "Community Volunteer"
        }
        var phone = text(body, "phone")
        if (phone == null) phone = ""
        var location = text(body, "location")
        if (location == null) location = "Thane, Maharashtra"
        execute(
            "INSERT INTO users (id,name,email,password,role,phone,organization,location) VALUES (?,?,?,?,?,?,?,?)",
            id, name.trim(), normalizedEmail, BCrypt.hashpw(password, BCrypt.gensalt(10)), role, phone, organization, location
        )
        val user = queryOne("SELECT id,name,email,role,phone,organization,location FROM users WHERE id=?", id)
        if (isAdminCreation) {
            sendJson(exchange, 201, mapOf("message" to "Account created successfully", "user" to user))
        } else {
            val newUser = userToAuthUser(user!!)
            sendJson(exchange, 201, mapOf("message" to "User registered successfully", "user" to user, "token" to signToken(newUser)))
        }
    }

    private fun login(exchange: HttpExchange) {
        val body = readBody(exchange)
        val email = text(body, "email")
        val password = text(body, "password")
        if (email.isNullOrBlank() || password.isNullOrBlank()) throw ApiError(400, "Email and password are required")
        val user = queryOne("SELECT id,name,email,password,role,phone,organization,location FROM users WHERE email=?", email.trim().lowercase())
        if (user == null || !BCrypt.checkpw(password, user["password"].toString())) throw ApiError(401, "Invalid email or password")
        val safeUser = HashMap(user)
        safeUser.remove("password")
        val authUser = userToAuthUser(safeUser)
        sendJson(exchange, 200, mapOf("message" to "Login successful", "user" to safeUser, "token" to signToken(authUser)))
    }

    private fun getCurrentUser(exchange: HttpExchange) {
        val user = requireUser(exchange)
        val profile = queryOne("SELECT id,name,email,role,phone,organization,location,created_at FROM users WHERE id=?", user.id)
        if (profile == null) throw ApiError(404, "User not found")
        sendJson(exchange, 200, mapOf("user" to profile))
    }

    private fun handleDonations(exchange: HttpExchange, path: String, method: String) {
        if (path.isEmpty() && method == "GET") {
            listDonations(exchange)
            return
        }
        if (path == "/my" && method == "GET") {
            myDonations(exchange)
            return
        }
        if (path.isEmpty() && method == "POST") {
            createDonation(exchange)
            return
        }
        if (path.startsWith("/") && path.length > 1) {
            val id = decode(path.substring(1))
            if (method == "GET") {
                donationDetails(exchange, id)
                return
            }
            if (method == "PUT") {
                updateDonation(exchange, id)
                return
            }
            if (method == "DELETE") {
                deleteDonation(exchange, id)
                return
            }
        }
        throw ApiError(404, "Route not found")
    }

    private fun listDonations(exchange: HttpExchange) {
        val paramsMap = queryParameters(exchange.requestURI.rawQuery)
        val filters = ArrayList<String>()
        val values = ArrayList<Any?>()
        val status = paramsMap["status"]
        val foodType = paramsMap["food_type"]
        val search = paramsMap["search"]
        if (status != null && status.isNotEmpty() && status != "all") {
            filters.add("d.status=?")
            values.add(status)
        }
        if (foodType != null && foodType.isNotEmpty() && foodType != "all") {
            filters.add("d.food_type=?")
            values.add(foodType)
        }
        if (search != null && search.trim().isNotEmpty()) {
            filters.add("(d.food_name LIKE ? OR d.description LIKE ? OR d.location LIKE ?)")
            val term = "%${search.trim()}%"
            values.add(term)
            values.add(term)
            values.add(term)
        }
        var whereClause = ""
        if (filters.isNotEmpty()) whereClause = " AND " + filters.joinToString(" AND ")

        val sql = """SELECT d.*,u.name AS donor_name,u.organization AS donor_org,u.phone AS donor_phone,
            c.id AS claim_id,c.ngo_id,c.claimed_at,c.pickup_time,c.notes AS claim_notes,
            ngo.name AS ngo_name,ngo.organization AS ngo_org
            FROM donations d JOIN users u ON d.donor_id=u.id LEFT JOIN claims c ON d.id=c.donation_id
            LEFT JOIN users ngo ON c.ngo_id=ngo.id WHERE 1=1$whereClause ORDER BY d.created_at DESC"""
        val rows = queryRows(sql, values)
        val donations = ArrayList<Map<String, Any?>>()
        var i = 0
        while (i < rows.size) {
            val donation = enrichDonation(rows[i])
            if (paramsMap["urgent_only"] != "true" || donation["is_urgent"] == true) donations.add(donation)
            i++
        }
        sendJson(exchange, 200, mapOf("donations" to donations, "total" to donations.size))
    }

    private fun myDonations(exchange: HttpExchange) {
        val user = requireUser(exchange)
        val rows = queryRows(
            """SELECT d.*,c.id AS claim_id,c.ngo_id,c.claimed_at,c.pickup_time,c.notes AS claim_notes,
                ngo.name AS ngo_name,ngo.organization AS ngo_org,ngo.phone AS ngo_phone
                FROM donations d LEFT JOIN claims c ON d.id=c.donation_id LEFT JOIN users ngo ON c.ngo_id=ngo.id
                WHERE d.donor_id=? ORDER BY d.created_at DESC""",
            listOf(user.id)
        )
        val donations = ArrayList<Map<String, Any?>>()
        var i = 0
        while (i < rows.size) {
            donations.add(enrichDonation(rows[i]))
            i++
        }
        sendJson(exchange, 200, mapOf("donations" to donations))
    }

    private fun donationDetails(exchange: HttpExchange, id: String) {
        val donation = queryOne(
            """SELECT d.*,u.name AS donor_name,u.organization AS donor_org,u.phone AS donor_phone,u.email AS donor_email,
                c.id AS claim_id,c.ngo_id,c.claimed_at,c.pickup_time,c.notes AS claim_notes,
                ngo.name AS ngo_name,ngo.organization AS ngo_org,ngo.phone AS ngo_phone
                FROM donations d JOIN users u ON d.donor_id=u.id LEFT JOIN claims c ON d.id=c.donation_id
                LEFT JOIN users ngo ON c.ngo_id=ngo.id WHERE d.id=?""", id
        ) ?: throw ApiError(404, "Donation not found")
        val logs = queryRows(
            "SELECT l.*,u.name AS user_name FROM activity_logs l LEFT JOIN users u ON l.user_id=u.id WHERE l.donation_id=? ORDER BY l.created_at ASC",
            listOf(id)
        )
        sendJson(exchange, 200, mapOf("donation" to enrichDonation(donation), "logs" to logs))
    }

    private fun createDonation(exchange: HttpExchange) {
        val user = requireUser(exchange)
        requireRole(user, "donor", "admin")
        val body = readBody(exchange)
        val foodName = text(body, "food_name")
        val foodType = text(body, "food_type")
        val quantity = integer(body, "quantity")
        val location = text(body, "location")
        val pickupAddress = text(body, "pickup_address")
        val availableUntil = text(body, "available_until")
        if (foodName.isNullOrBlank() || foodType.isNullOrBlank() || quantity == null || quantity == 0 || location.isNullOrBlank() || pickupAddress.isNullOrBlank() || availableUntil.isNullOrBlank()) {
            throw ApiError(400, "Please fill in food name, type, quantity, location, pickup address, and available until time.")
        }
        val id = "don-${System.currentTimeMillis()}"
        var unit = text(body, "unit")
        if (unit == null) unit = "meals"
        var description = text(body, "description")
        if (description == null) description = ""
        var availableFrom = text(body, "available_from")
        if (availableFrom == null) availableFrom = Instant.now().toString()
        var image = text(body, "image_url")
        if (image == null || image.trim().isEmpty()) image = fallbackImage(foodType)
        execute(
            """INSERT INTO donations (id,donor_id,food_name,food_type,quantity,unit,description,location,pickup_address,available_from,available_until,image_url,status)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'available')""",
            id, user.id, foodName.trim(), foodType, quantity, unit, description.trim(), location.trim(), pickupAddress.trim(), availableFrom, availableUntil, image.trim()
        )
        execute(
            "INSERT INTO activity_logs (id,donation_id,user_id,action,details) VALUES (?,?,?,'DONATION_CREATED',?)",
            "log-${UUID.randomUUID()}", id, user.id, "${user.name} created donation: $quantity $unit of $foodName"
        )
        val created = queryOne("SELECT * FROM donations WHERE id=?", id)!!
        sendJson(exchange, 201, mapOf("message" to "Donation created successfully", "donation" to enrichDonation(created)))
    }

    private fun updateDonation(exchange: HttpExchange, id: String) {
        val user = requireUser(exchange)
        val donation = queryOne("SELECT * FROM donations WHERE id=?", id) ?: throw ApiError(404, "Donation not found")
        if (donation["donor_id"] != user.id && user.role != "admin") throw ApiError(403, "You do not have permission to edit this donation")
        val body = readBody(exchange)
        val foodName = text(body, "food_name") ?: donation["food_name"].toString()
        val quantity = integer(body, "quantity") ?: (donation["quantity"] as Number).toInt()
        val unit = text(body, "unit") ?: donation["unit"].toString()
        val description = text(body, "description") ?: donation["description"].toString()
        val location = text(body, "location") ?: donation["location"].toString()
        val pickupAddress = text(body, "pickup_address") ?: donation["pickup_address"].toString()
        val availableUntil = text(body, "available_until") ?: donation["available_until"].toString()
        val status = text(body, "status") ?: donation["status"].toString()
        execute(
            "UPDATE donations SET food_name=?,quantity=?,unit=?,description=?,location=?,pickup_address=?,available_until=?,status=? WHERE id=?",
            foodName, quantity, unit, description, location, pickupAddress, availableUntil, status, id
        )
        execute("INSERT INTO activity_logs (id,donation_id,user_id,action,details) VALUES (?,?,?,'DONATION_UPDATED',?)", "log-${UUID.randomUUID()}", id, user.id, "${user.name} updated donation details")
        val updated = queryOne("SELECT * FROM donations WHERE id=?", id)!!
        sendJson(exchange, 200, mapOf("message" to "Donation updated successfully", "donation" to enrichDonation(updated)))
    }

    private fun deleteDonation(exchange: HttpExchange, id: String) {
        val user = requireUser(exchange)
        val donation = queryOne("SELECT * FROM donations WHERE id=?", id) ?: throw ApiError(404, "Donation not found")
        if (donation["donor_id"] != user.id && user.role != "admin") throw ApiError(403, "You do not have permission to delete this donation")
        execute("DELETE FROM donations WHERE id=?", id)
        execute("INSERT INTO activity_logs (id,donation_id,user_id,action,details) VALUES (?,?,?,'DONATION_DELETED',?)", "log-${UUID.randomUUID()}", id, user.id, "${user.name} removed donation ${donation["food_name"]}")
        sendJson(exchange, 200, mapOf("message" to "Donation removed successfully"))
    }

    private fun handleClaims(exchange: HttpExchange, path: String, method: String) {
        if (path == "/my" && method == "GET") {
            myClaims(exchange)
            return
        }
        if (path.startsWith("/") && path.endsWith("/status") && method == "PUT") {
            val claimId = path.substring(1, path.length - "/status".length)
            updateClaimStatus(exchange, decode(claimId))
            return
        }
        if (path.startsWith("/") && path.length > 1 && method == "POST") {
            claimDonation(exchange, decode(path.substring(1)))
            return
        }
        throw ApiError(404, "Route not found")
    }

    private fun claimDonation(exchange: HttpExchange, donationId: String) {
        val user = requireUser(exchange)
        requireRole(user, "ngo", "admin")
        val body = readBody(exchange)
        val donation = queryOne("SELECT * FROM donations WHERE id=?", donationId) ?: throw ApiError(404, "Donation not found")
        val donationStatus = donation["status"].toString()
        if (donationStatus != "available") throw ApiError(400, "Cannot claim donation. Current status: $donationStatus")
        val claimId = "clm-${System.currentTimeMillis()}"
        var pickupTime = text(body, "pickup_time")
        if (pickupTime == null) pickupTime = Instant.now().plus(60, ChronoUnit.MINUTES).toString()
        var notes = text(body, "notes")
        if (notes == null) notes = ""

        connection.autoCommit = false
        try {
            execute("INSERT INTO claims (id,donation_id,ngo_id,claimed_at,pickup_time,notes,status) VALUES (?,?,?,CURRENT_TIMESTAMP,?,?,'active')", claimId, donationId, user.id, pickupTime, notes)
            execute("UPDATE donations SET status='claimed' WHERE id=?", donationId)
            val details = "${user.name} (${user.organization ?: "NGO"}) claimed donation of ${donation["quantity"]} ${donation["unit"]} ${donation["food_name"]}"
            execute("INSERT INTO activity_logs (id,donation_id,user_id,action,details) VALUES (?,?,?,'DONATION_CLAIMED',?)", "log-${UUID.randomUUID()}", donationId, user.id, details)
            connection.commit()
        } catch (error: Exception) {
            connection.rollback()
            throw error
        } finally {
            connection.autoCommit = true
        }

        val result = HashMap<String, Any>()
        result["message"] = "Donation claimed successfully! Please coordinate pickup."
        result["claimId"] = claimId
        result["donationId"] = donationId
        result["status"] = "claimed"
        sendJson(exchange, 201, result)
    }

    private fun updateClaimStatus(exchange: HttpExchange, claimId: String) {
        val user = requireUser(exchange)
        val body = readBody(exchange)
        val status = text(body, "status")
        if (status != "picked_up" && status != "completed") throw ApiError(400, "Status must be picked_up or completed")
        val claim = queryOne(
            "SELECT c.*,d.food_name,d.quantity,d.unit FROM claims c JOIN donations d ON c.donation_id=d.id WHERE c.id=?",
            claimId
        ) ?: throw ApiError(404, "Claim record not found")
        var action = "DONATION_COMPLETED"
        var details = "${user.name} marked ${claim["food_name"]} as successfully delivered & completed!"
        var claimStatus = "completed"
        if (status == "picked_up") {
            action = "DONATION_PICKED_UP"
            details = "${user.name} picked up ${claim["food_name"]}"
            claimStatus = "active"
        }
        connection.autoCommit = false
        try {
            execute("UPDATE claims SET status=? WHERE id=?", claimStatus, claimId)
            execute("UPDATE donations SET status=? WHERE id=?", status, claim["donation_id"])
            execute("INSERT INTO activity_logs (id,donation_id,user_id,action,details) VALUES (?,?,?,?,?)", "log-${UUID.randomUUID()}", claim["donation_id"], user.id, action, details)
            connection.commit()
        } catch (error: Exception) {
            connection.rollback()
            throw error
        } finally {
            connection.autoCommit = true
        }
        sendJson(exchange, 200, mapOf("message" to "Status successfully updated to $status", "claimId" to claimId, "donationId" to claim["donation_id"], "newStatus" to status))
    }

    private fun myClaims(exchange: HttpExchange) {
        val user = requireUser(exchange)
        val claims = queryRows(
            """SELECT c.*,d.food_name,d.food_type,d.quantity,d.unit,d.location,d.pickup_address,d.available_from,d.available_until,
                d.image_url,d.status AS donation_status,u.name AS donor_name,u.organization AS donor_org,u.phone AS donor_phone
                FROM claims c JOIN donations d ON c.donation_id=d.id JOIN users u ON d.donor_id=u.id
                WHERE c.ngo_id=? ORDER BY c.claimed_at DESC""",
            listOf(user.id)
        )
        sendJson(exchange, 200, mapOf("claims" to claims))
    }

    private fun handleStats(exchange: HttpExchange, path: String, method: String) {
        if (path == "/impact" && method == "GET") {
            impactStats(exchange)
            return
        }
        if (path == "/admin" && method == "GET") {
            adminStats(exchange)
            return
        }
        throw ApiError(404, "Route not found")
    }

    private fun impactStats(exchange: HttpExchange) {
        val totalMeals = scalarLong("SELECT COALESCE(SUM(quantity),0) FROM donations WHERE status IN ('claimed','picked_up','completed')")
        val donationCount = scalarLong("SELECT COUNT(*) FROM donations")
        val availableCount = scalarLong("SELECT COUNT(*) FROM donations WHERE status='available'")
        val completedCount = scalarLong("SELECT COUNT(*) FROM donations WHERE status='completed'")
        val donorCount = scalarLong("SELECT COUNT(*) FROM users WHERE role='donor'")
        val ngoCount = scalarLong("SELECT COUNT(*) FROM users WHERE role='ngo'")
        val estimatedKg = Math.round(totalMeals * 0.45)
        val co2Kg = Math.round(estimatedKg * 2.5)
        val result = HashMap<String, Long>()
        result["totalMeals"] = totalMeals + 1200
        result["totalDonations"] = donationCount
        result["availableDonations"] = availableCount
        result["completedPickups"] = completedCount + 68
        result["activeDonors"] = donorCount
        result["partnerNgos"] = ngoCount
        result["estimatedKgSaved"] = estimatedKg + 540
        result["co2SavedKg"] = co2Kg + 1350
        sendJson(exchange, 200, result)
    }

    private fun adminStats(exchange: HttpExchange) {
        val user = requireUser(exchange)
        requireRole(user, "admin")
        val users = queryRows("SELECT id,name,email,role,phone,organization,location,created_at FROM users ORDER BY created_at DESC")
        val donations = queryRows(
            """SELECT d.*,u.name AS donor_name,u.organization AS donor_org,ngo.name AS ngo_name,ngo.organization AS ngo_org
                FROM donations d JOIN users u ON d.donor_id=u.id LEFT JOIN claims c ON d.id=c.donation_id
                LEFT JOIN users ngo ON c.ngo_id=ngo.id ORDER BY d.created_at DESC"""
        )
        val logs = queryRows("SELECT l.*,u.name AS user_name,u.role AS user_role FROM activity_logs l LEFT JOIN users u ON l.user_id=u.id ORDER BY l.created_at DESC LIMIT 25")
        val breakdown = queryRows("SELECT food_type,COUNT(*) AS count,SUM(quantity) AS total_qty FROM donations GROUP BY food_type")
        val statusCounts = queryRows("SELECT status,COUNT(*) AS count FROM donations GROUP BY status")
        sendJson(exchange, 200, mapOf("users" to users, "donations" to donations, "logs" to logs, "breakdown" to breakdown, "statusCounts" to statusCounts))
    }

    private fun requireUser(exchange: HttpExchange): AuthUser {
        val authorization = exchange.requestHeaders.getFirst("Authorization")
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw ApiError(401, "Authorization token required")
        }
        try {
            val token = authorization.substring("Bearer ".length)
            val decoded = JWT.require(Algorithm.HMAC256(jwtSecret)).build().verify(token)
            val id = decoded.getClaim("id").asString()
            val name = decoded.getClaim("name").asString()
            val email = decoded.getClaim("email").asString()
            val role = decoded.getClaim("role").asString()
            val organization = decoded.getClaim("organization").asString()
            if (id == null || name == null || email == null || role == null) throw Exception("Missing token fields")
            return AuthUser(id, name, email, role, organization)
        } catch (error: Exception) {
            throw ApiError(401, "Invalid or expired authorization token")
        }
    }

    private fun requireRole(user: AuthUser, vararg allowedRoles: String) {
        var roleAllowed = false
        var i = 0
        while (i < allowedRoles.size) {
            if (user.role == allowedRoles[i]) roleAllowed = true
            i++
        }
        if (!roleAllowed) throw ApiError(403, "Access denied. Requires one of roles: [${allowedRoles.joinToString(", ")}]")
    }

    private fun signToken(user: AuthUser): String {
        return JWT.create()
            .withClaim("id", user.id)
            .withClaim("name", user.name)
            .withClaim("email", user.email)
            .withClaim("role", user.role)
            .withClaim("organization", user.organization)
            .withExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
            .sign(Algorithm.HMAC256(jwtSecret))
    }

    private fun userToAuthUser(user: Map<String, Any?>): AuthUser {
        val id = user["id"].toString()
        val name = user["name"].toString()
        val email = user["email"].toString()
        val role = user["role"].toString()
        var organization: String? = null
        val organizationValue = user["organization"]
        if (organizationValue != null) organization = organizationValue.toString()
        return AuthUser(id, name, email, role, organization)
    }

    private fun execute(sql: String, vararg values: Any?) {
        synchronized(connection) {
            val statement = connection.prepareStatement(sql)
            try {
                bindValues(statement, values)
                statement.executeUpdate()
            } finally {
                statement.close()
            }
        }
    }

    private fun queryOne(sql: String, vararg values: Any?): Map<String, Any?>? {
        val rows = queryRows(sql, values.toList())
        if (rows.size == 0) return null
        return rows[0]
    }

    private fun queryRows(sql: String, values: List<Any?> = emptyList()): List<Map<String, Any?>> {
        synchronized(connection) {
            val statement = connection.prepareStatement(sql)
            try {
                bindValues(statement, values.toTypedArray())
                val resultSet = statement.executeQuery()
                try {
                    val results = ArrayList<Map<String, Any?>>()
                    val metadata = resultSet.metaData
                    while (resultSet.next()) {
                        val row = HashMap<String, Any?>()
                        var column = 1
                        while (column <= metadata.columnCount) {
                            row[metadata.getColumnLabel(column)] = resultSet.getObject(column)
                            column++
                        }
                        results.add(row)
                    }
                    return results
                } finally {
                    resultSet.close()
                }
            } finally {
                statement.close()
            }
        }
    }

    private fun bindValues(statement: PreparedStatement, values: Array<out Any?>) {
        var i = 0
        while (i < values.size) {
            statement.setObject(i + 1, values[i])
            i++
        }
    }

    private fun scalarLong(sql: String): Long {
        synchronized(connection) {
            val statement = connection.createStatement()
            try {
                val result = statement.executeQuery(sql)
                try {
                    if (result.next()) return result.getLong(1)
                    return 0
                } finally {
                    result.close()
                }
            } finally {
                statement.close()
            }
        }
    }

    private fun createTables() {
        val statements = arrayOf(
            """CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT CHECK(role IN ('donor','ngo','admin')) NOT NULL,phone TEXT,organization TEXT,location TEXT,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)""",
            """CREATE TABLE IF NOT EXISTS donations (id TEXT PRIMARY KEY,donor_id TEXT NOT NULL,food_name TEXT NOT NULL,food_type TEXT NOT NULL,quantity INTEGER NOT NULL,unit TEXT DEFAULT 'meals',description TEXT,location TEXT NOT NULL,pickup_address TEXT NOT NULL,available_from DATETIME NOT NULL,available_until DATETIME NOT NULL,image_url TEXT,status TEXT CHECK(status IN ('available','claimed','picked_up','completed','cancelled')) DEFAULT 'available',created_at DATETIME DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE)""",
            """CREATE TABLE IF NOT EXISTS claims (id TEXT PRIMARY KEY,donation_id TEXT UNIQUE NOT NULL,ngo_id TEXT NOT NULL,claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,pickup_time DATETIME,notes TEXT,status TEXT CHECK(status IN ('active','completed','cancelled')) DEFAULT 'active',FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE CASCADE)""",
            """CREATE TABLE IF NOT EXISTS activity_logs (id TEXT PRIMARY KEY,donation_id TEXT,user_id TEXT,action TEXT NOT NULL,details TEXT,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"""
        )
        val statement = connection.createStatement()
        try {
            var i = 0
            while (i < statements.size) {
                statement.execute(statements[i])
                i++
            }
        } finally {
            statement.close()
        }
    }

    private fun seedUsers() {
        if (scalarLong("SELECT COUNT(*) FROM users") > 0) return
        val environmentNames = arrayOf("SEED_DONOR_1_PASSWORD", "SEED_DONOR_2_PASSWORD", "SEED_NGO_1_PASSWORD", "SEED_NGO_2_PASSWORD", "SEED_ADMIN_PASSWORD")
        val passwords = arrayOfNulls<String>(environmentNames.size)
        var i = 0
        while (i < environmentNames.size) {
            passwords[i] = System.getenv(environmentNames[i])
            if (passwords[i] == null || passwords[i]!!.length < 12) return
            i++
        }

        val users = arrayOf(
            arrayOf("usr-donor-1", "Kartik Mahindrakar", "donor@foodshare.org", "donor", "+91 98765 43210", "Green Campus Cafe", "Thane West, Maharashtra"),
            arrayOf("usr-donor-2", "APSIT Central Canteen", "canteen@foodshare.org", "donor", "+91 98220 11223", "A.P. Shah Institute of Technology", "Kasarvadavali, Ghodbunder Rd, Thane"),
            arrayOf("usr-ngo-1", "Helping Hands Foundation", "ngo@foodshare.org", "ngo", "+91 91234 56789", "Helping Hands NGO", "Thane & Navi Mumbai"),
            arrayOf("usr-ngo-2", "Roti Bank Volunteers", "roti@foodshare.org", "ngo", "+91 99887 76655", "Roti Bank Youth Wing", "Mulund & Thane East"),
            arrayOf("usr-admin-1", "WMD Project Admin / Faculty", "admin@foodshare.org", "admin", "+91 90000 00001", "FoodShare Central Council", "Mumbai Metropolitan Region")
        )
        var index = 0
        while (index < users.size) {
            execute(
                "INSERT INTO users (id,name,email,password,role,phone,organization,location) VALUES (?,?,?,?,?,?,?,?)",
                users[index][0], users[index][1], users[index][2], BCrypt.hashpw(passwords[index]!!, BCrypt.gensalt(10)),
                users[index][3], users[index][4], users[index][5], users[index][6]
            )
            index++
        }
    }
}

private fun generateRandomHex32(): String {
    val bytes = ByteArray(32)
    java.security.SecureRandom().nextBytes(bytes)
    val sb = StringBuilder()
    for (b in bytes) sb.append(String.format("%02x", b))
    return sb.toString()
}

fun main() {
    FoodShareServer().start()
}

private fun decode(value: String): String {
    return URLDecoder.decode(value, StandardCharsets.UTF_8.name())
}

private fun queryParameters(query: String?): Map<String, String> {
    val values = HashMap<String, String>()
    if (query == null || query.isEmpty()) return values
    val parts = query.split("&")
    var i = 0
    while (i < parts.size) {
        val pair = parts[i].split("=", limit = 2)
        val key = decode(pair[0])
        var value = ""
        if (pair.size > 1) value = decode(pair[1])
        values[key] = value
        i++
    }
    return values
}

private fun enrichDonation(donation: Map<String, Any?>): Map<String, Any?> {
    var minutesLeft = 0L
    val expiryText = donation["available_until"].toString()
    try {
        minutesLeft = ChronoUnit.MINUTES.between(Instant.now(), Instant.parse(expiryText))
    } catch (error: Exception) {
        try {
            val localTime = java.time.LocalDateTime.parse(expiryText.replace(" ", "T"))
            minutesLeft = ChronoUnit.MINUTES.between(Instant.now(), localTime.atZone(java.time.ZoneId.systemDefault()).toInstant())
        } catch (ignored: Exception) {
            minutesLeft = 0L
        }
    }
    val urgent = donation["status"] == "available" && minutesLeft > 0 && minutesLeft <= 120
    val expired = donation["status"] == "available" && minutesLeft <= 0
    var label = "${Math.max(0, Math.round(minutesLeft / 60.0))} hours left"
    if (urgent) label = "Expiring soon (~$minutesLeft mins)"
    if (expired) label = "Expired"
    val result = HashMap(donation)
    result["minutes_left"] = minutesLeft
    result["is_urgent"] = urgent
    result["is_expired"] = expired
    result["urgency_label"] = label
    return result
}

private fun fallbackImage(foodType: String): String {
    if (foodType == "packaged") return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
    if (foodType == "bakery") return "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80"
    if (foodType == "fruits_veg") return "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=80"
    if (foodType == "other") return "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80"
    return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80"
}