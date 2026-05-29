export function initTabs() {
    const radioInputs = document.querySelectorAll('.radio-inputs input[type="radio"]');
    const tabcontents = document.querySelectorAll(".tabcontent");

    radioInputs.forEach(input => {
        input.addEventListener("change", (evt) => {
            const targetId = evt.target.getAttribute("data-target");

            tabcontents.forEach(content => {
                content.style.display = "none";
            });

            const selectedContent = document.getElementById(targetId);
            if (selectedContent) {
                selectedContent.style.display = "block";
                
                window.dispatchEvent(new Event('resize'));
            }
        });
    });
}
