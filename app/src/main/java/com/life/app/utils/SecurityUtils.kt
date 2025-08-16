package com.life.app.utils

import java.security.MessageDigest

object SecurityUtils {

    /**
     * Hashes a string using SHA-256.
     * NOTE: For a production app, a stronger key derivation function like
     * PBKDF2 or Argon2 should be used to protect against brute-force attacks.
     */
    fun hashString(input: String): String {
        return MessageDigest
            .getInstance("SHA-256")
            .digest(input.toByteArray())
            .fold("") { str, it -> str + "%02x".format(it) }
    }
}
