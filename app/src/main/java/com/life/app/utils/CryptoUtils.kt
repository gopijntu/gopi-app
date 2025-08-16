package com.life.app.utils

import javax.crypto.Cipher
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec
import java.security.SecureRandom

object CryptoUtils {

    private const val ALGORITHM = "AES"
    private const val TRANSFORMATION = "AES/CBC/PKCS5Padding"
    private const val ITERATION_COUNT = 65536
    private const val KEY_LENGTH = 256
    private const val SALT_SIZE = 16
    private const val IV_SIZE = 16

    fun encrypt(data: ByteArray, password: String): ByteArray {
        val salt = ByteArray(SALT_SIZE)
        SecureRandom().nextBytes(salt)

        val keySpec = PBEKeySpec(password.toCharArray(), salt, ITERATION_COUNT, KEY_LENGTH)
        val keyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        val secretKey = SecretKeySpec(keyFactory.generateSecret(keySpec).encoded, ALGORITHM)

        val iv = ByteArray(IV_SIZE)
        SecureRandom().nextBytes(iv)
        val ivSpec = IvParameterSpec(iv)

        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec)
        val encryptedData = cipher.doFinal(data)

        // Combine salt, IV, and encrypted data for storage
        return salt + iv + encryptedData
    }

    fun decrypt(encryptedDataWithSaltAndIv: ByteArray, password: String): ByteArray {
        val salt = encryptedDataWithSaltAndIv.copyOfRange(0, SALT_SIZE)
        val iv = encryptedDataWithSaltAndIv.copyOfRange(SALT_SIZE, SALT_SIZE + IV_SIZE)
        val encryptedData = encryptedDataWithSaltAndIv.copyOfRange(SALT_SIZE + IV_SIZE, encryptedDataWithSaltAndIv.size)

        val keySpec = PBEKeySpec(password.toCharArray(), salt, ITERATION_COUNT, KEY_LENGTH)
        val keyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        val secretKey = SecretKeySpec(keyFactory.generateSecret(keySpec).encoded, ALGORITHM)

        val ivSpec = IvParameterSpec(iv)
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec)

        return cipher.doFinal(encryptedData)
    }
}
