document.addEventListener("DOMContentLoaded", function () {
  const categories = document.querySelector(".categories");
  const scrollBtn = document.querySelector(".scroll-btn");
  const categoriesContainer = document.querySelector(".categories-container");
  const searchBar = document.querySelector(".search-bar input");
  const questionsList = document.querySelector(".question-list");

  let scrollAmount = 0; // Tracks current scroll position

  // Scroll categories when ">" button is clicked
  scrollBtn.addEventListener("click", () => {
    const containerWidth = categoriesContainer.offsetWidth;
    const totalScrollWidth = categories.scrollWidth;

    // Calculate the next scroll position
    scrollAmount += containerWidth;
    categories.style.transform = `translateX(-${scrollAmount}px)`;

    // Hide the button if all categories are visible
    if (scrollAmount + containerWidth >= totalScrollWidth) {
      scrollBtn.style.display = "none";
    }
  });

  // Initial check: Hide button if not scrollable
  if (categories.scrollWidth <= categoriesContainer.offsetWidth) {
    scrollBtn.style.display = "none";
  }

  // Add active class toggling for categories
  document.querySelectorAll(".category").forEach((category) => {
    category.addEventListener("click", () => {
      document.querySelectorAll(".category").forEach((cat) => cat.classList.remove("active"));
      category.classList.add("active");
    });
  });

  // Add active class toggling for filters
  document.querySelectorAll(".filter").forEach((filter) => {
    filter.addEventListener("click", () => {
      document.querySelectorAll(".filter").forEach((flt) => flt.classList.remove("active"));
      filter.classList.add("active");
    });
  });

  // API Call to Classify Text
  const classifyText = async (text) => {
    try {
      // Step 1: Get Bearer Token
      const authResponse = await fetch("https://auth.app.labelf.ai/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: "9wfRqxq7BAKV-EAPdSAP35Sl65N-cLK8qrnAzF75oyk",
          client_secret: "3B4b-gm5Y4QUtaKPOWVCLgY-W9UNk1q3aLBA7lVqL7HAedI2NObrYd1jRw1nPK79PlEFI_WU-pNm-Vt7GEgdEQ",
        }),
      });

      const authData = await authResponse.json();
      const accessToken = authData.access_token;

      // Step 2: Send Text for Classification
      const response = await fetch("https://api.app.labelf.ai/classify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }), // Pass the input text
      });

      if (!response.ok) {
        throw new Error("Error classifying text");
      }

      const result = await response.json();
      return result; // Returns classification data
    } catch (error) {
      console.error("API Error:", error);
      return { error: "Unable to classify text. Please try again later." };
    }
  };

  // Event Listener for Search Bar Input
  searchBar.addEventListener("keypress", async (event) => {
    if (event.key === "Enter") {
      const inputText = searchBar.value.trim();
      if (inputText) {
        // Call classification API
        const classificationResult = await classifyText(inputText);

        // Add result to questions list
        const questionDiv = document.createElement("div");
        questionDiv.className = "question";
        questionDiv.innerHTML = `
          <div class="question-header">
            <span>User</span>
            <span>Now</span>
          </div>
          <div class="question-body">${inputText}</div>
          <div class="question-footer">
            <strong>Category:</strong> ${classificationResult.category || "Unknown"}
            <button>👍 0</button>
          </div>
        `;
        questionsList.prepend(questionDiv); // Add the new question at the top
        searchBar.value = ""; // Clear the input field
      }
    }
  });
});
