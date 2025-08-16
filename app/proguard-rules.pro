# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /Users/user/tools/android-sdk/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# If you use reflection to access classes in testing code, prevent
# ProGuard from removing or obfuscating them.
-keepattributes Signature
-keep class com.google.vending.licensing.ILicensingService
-keep class com.android.vending.licensing.ILicensingService

-dontwarn com.squareup.okhttp.**
