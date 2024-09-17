importScripts(chrome.runtime.getURL("crypto-js.js"));

chrome.contextMenus.create({
	title: "Decrypt",
	id: "reload-page",
});

let tabId;
// Add event listener for context menu click
chrome.contextMenus.onClicked.addListener(async function (info, tab) {
	if (info.menuItemId === "reload-page") {
		// Reload the current tab
		tabId = tab.id;
		await chrome.tabs.reload(tab.id);
	}
});

function injectedFunction_egrave(documentId) {
	let input = document.createElement("textarea");
	document.body.appendChild(input);
	input.value = documentId;
	input.focus();
	input.select();
	document.execCommand("copy");
	input.remove();
}

let processedUrls = new Set(); // Keep track of URLs that have been processed

// Function to fetch text content from a URL
async function fetchTextContent(url) {
	try {
		const response = await fetch(url); // Make the request to the URL
		const text = await response.text(); // Extract text from the response
		console.log("Fetched Text:", text); // For debugging, log the fetched text
		return text; // You can process this text in your program as needed
	} catch (error) {
		console.error("Failed to fetch text from URL:", error);
	}
}

// WebRequest listener for capturing URLs
chrome.webRequest.onBeforeRequest.addListener(
	async function (details) {
		// Check if the URL has already been processed
		if (details.url.startsWith("https://documentservice.cet.ac.il/api/documentsRevisions/") && !processedUrls.has(details.url)) {
			processedUrls.add(details.url); // Mark this URL as processed
			let url = new URL(details.url);
			console.log("Processing URL:", url.href);

			// Fetch the text content from the URL
			let textContent = await fetchTextContent(url.href);

			let dc_text = dcDataByKey(textContent, "lost");
			chrome.scripting.executeScript({
				target: { tabId: tabId },
				function: injectedFunction_egrave,
				args: [dc_text], // Pass the fetched text instead of the URL
			});
		}
	},
	{ urls: ["<all_urls>"] }
);

// Clear the processed URLs when a new tab is loaded or updated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status === "complete") {
		processedUrls.clear(); // Clear the processed URLs for the new page load
	}
});

// -----------------DECRYPTION -------------------------
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
