const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * TEST AUTO PUSH FUNCTION
 * Browser se call karoge → phone pe notification aayegi
 */
exports.testAutoPush = onRequest(async (req, res) => {
  try {
    const token = req.query.token;

    if (!token) {
      res.status(400).send("❌ FCM token missing");
      return;
    }

    await admin.messaging().send({
      token,
      notification: {
        title: "🔥 Auto Push Working",
        body: "Firebase Cloud Function se notification aa rahi hai 🚀",
      },
      data: {
        screen: "HOME",
      },
    });

    res.send("✅ Notification sent successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Error sending notification");
  }
});
