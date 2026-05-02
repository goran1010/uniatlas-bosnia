function validateAddData(e) {
  if (e.target.name === "code") {
    const value = e.target.value;

    if (isNaN(Number(value)) || value.length !== 5) {
      e.target.setCustomValidity("Postal code must be a 5-digit number");
    } else {
      e.target.setCustomValidity("");
    }
  }
  if (e.target.name === "city" && !e.target.value.trim()) {
    e.target.setCustomValidity("City name cannot be empty");
  } else if (e.target.name === "city") {
    e.target.setCustomValidity("");
  }
  e.target.reportValidity();
}

export { validateAddData };
