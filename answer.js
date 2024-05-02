function parseJson() {
	const jsonData = document.getElementById("jsonData").value.trim();
	let jsonObject;

	try {
		jsonObject = JSON.parse(jsonData);
	} catch (error) {
		console.error("Invalid JSON format:", error);
		return;
	}

	if (
		!jsonObject ||
		!jsonObject.documentModel ||
		!jsonObject.documentModel.e_questionnaire ||
		!jsonObject.documentModel.e_questionnaire.e_page
	) {
		console.error("JSON does not contain any questions.");
		return;
	}

	const pages = jsonObject.documentModel.e_questionnaire.e_page;
	const displayElement = document.getElementById("questionsContainer");
	displayElement.innerHTML = ""; // Clear previous results

	pages.forEach((page) => {
		if (!page.e_question) return;

		page.e_question.forEach((question) => {
			if (question.e_multiChoice) {
				displayQuestion(
					question.e_multiChoice,
					displayElement,
					question.instructions
				);
			} else if (question.e_singleChoice) {
				displayQuestion(
					question.e_singleChoice,
					displayElement,
					question.htmlContent
				);
			} else if (question.e_cloze && question.e_cloze.e_dropdownField) {
				displayDropdownFieldQuestion(question, displayElement);
			} else {
				console.log("NONE");
			}
		});
	});
}

function displayDropdownFieldQuestion(question, displayElement) {
	const dropdownField = question.e_cloze && question.e_cloze.e_dropdownField;

	if (!dropdownField || !dropdownField.length) return;

	dropdownField.forEach((dropdown) => {
		const questionTitle = "Dropdown:";

		const questionDiv = createQuestionElement(questionTitle);
		questionDiv.classList.add("dropdown-div"); // Add 'dropdown-div' class to question div

		const options = dropdown.option;
		if (!options || !options.length) return;

		const correctOptionIndex = dropdown.correctOptionValue;

		options.forEach((option, index) => {
			const optionElement = document.createElement("p");
			optionElement.innerHTML = option.title || "Option Title Not Found";
			optionElement.classList.add("dropdown-answer"); // Add 'dropdown-answer' class

			if (index === correctOptionIndex) {
				optionElement.classList.add("correct"); // Add 'correct' class to correct option
			} else {
				optionElement.classList.add("incorrect"); // Add 'incorrect' class to incorrect options
			}

			questionDiv.appendChild(optionElement);
		});

		displayElement.appendChild(questionDiv);
	});
}

function displayQuestion(question, displayElement, content) {
	if (!question || !question.e_option) return;

	const options = question.e_option;

	const questionTitle = extractQuestionTitle(content);

	const questionDiv = createQuestionElement(questionTitle);

	options.forEach((option) => {
		appendOptionToQuestion(option, questionDiv);
	});

	displayElement.appendChild(questionDiv);
}

function createQuestionElement(questionTitle) {
	const questionDiv = document.createElement("div");
	const titleElement = document.createElement("p");
	titleElement.innerHTML = questionTitle;
	titleElement.classList.add("title"); // Add 'title' class
	questionDiv.appendChild(titleElement);
	return questionDiv;
}

function appendOptionToQuestion(option, questionDiv) {
	const optionElement = document.createElement("p");
	optionElement.innerHTML = option.labelHtml;
	optionElement.classList.add("answer"); // Add 'answer' class to every option
	if (option.correct) {
		optionElement.classList.add("correct"); // Add 'correct' class to correct option
	} else {
		optionElement.classList.add("incorrect"); // Add 'incorrect' class to incorrect option
	}
	questionDiv.appendChild(optionElement);
}

function extractQuestionTitle(content, instructions) {
	if (content) {
		// Regular expression to match text that looks like a question title
		const titleRegex = /^(?:\d+\.\s*)?(.*)$/;

		// Split the content into lines
		const lines = content.split("\n");

		// Iterate over the lines and look for the first line that matches the regex
		for (const line of lines) {
			const match = line.trim().match(titleRegex);
			if (match && match[1]) {
				return match[1].trim(); // Return the matched title
			}
		}
	}

	if (instructions) {
		return instructions.trim();
	}

	return "Question Title Not Found";
}
