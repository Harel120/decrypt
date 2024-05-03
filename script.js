let documentUrlDisp;
const firebaseConfig = {
  apiKey: "AIzaSyDbfLProZTLYpznzoTztxLhVcKwszsvfk4",
  authDomain: "vcampusdecrypt.firebaseapp.com",
  projectId: "vcampusdecrypt",
  storageBucket: "vcampusdecrypt.appspot.com",
  messagingSenderId: "1068153982366",
  appId: "1:1068153982366:web:85963b878f79176be59a8f"
};
function dcDataByKey(encryptedText, encryptionKey) {
	try {
		var parsedText = CryptoJS.enc.Base64.parse(encryptedText.replace('"', ""));
		var hashedKey = CryptoJS.SHA256(encryptionKey);
		var decrypted = CryptoJS.AES.decrypt(
			{
				ciphertext: parsedText,
			},
			hashedKey,
			{
				iv: CryptoJS.enc.Hex.parse("00000000000000000000000000000000"),
			}
		).toString(CryptoJS.enc.Utf8);
		return decrypted;
	} catch (error) {
		console.error("Decryption error:", error);
		return null;
	}
}

function extractDocumentProperties(decryptedText) {
	try {
		// Parse the decrypted text as JSON
		var decryptedObject = JSON.parse(decryptedText);

		// Access the nested "Result" object
		var resultObject = decryptedObject.Result;

		// Extract properties
		var documentPlayerUrl = resultObject.documentPlayerUrl;
		var documentUrl = resultObject.documentUrl;

		return { documentPlayerUrl, documentUrl };
	} catch (error) {
		console.error("Error parsing decrypted text as JSON:", error);
		return { documentPlayerUrl: null, documentUrl: null }; // Return null values if parsing fails
	}
}

function decrypt() {
	var encryptedText = document.getElementById("encryptedText").value;
	var encryptionKey = "lost"; // Default encryption key to "lost"
	var decryptedText = dcDataByKey(encryptedText, encryptionKey);

	documentUrlDisp = "";
	if (decryptedText !== null) {
		var { documentPlayerUrl, documentUrl } =
			extractDocumentProperties(decryptedText);
		documentUrlDisp = documentUrl;
		document.getElementById("decryptedText").value = decryptedText;
		document.getElementById("documentPlayerUrl").value = documentPlayerUrl;
	} else {
		document.getElementById("decryptedText").value =
			"Decryption failed. Check console for details.";
		document.getElementById("documentPlayerUrl").value =
			"Decryption failed. Check console for details.";
	}
}
function copyDecryptedText() {
	var decryptedText = document.getElementById("decryptedText");
	decryptedText.select();
	document.execCommand("copy");
}

function openDocumentUrl() {
	if (documentUrlDisp) {
		window.open(documentUrlDisp, "_blank");
	} else {
		alert("Document URL is not available.");
	}
}
