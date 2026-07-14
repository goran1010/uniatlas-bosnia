import { Spinner } from "../../../src/utils/Spinner";
import { render, screen } from "@testing-library/react";

describe("Spinner component", () => {
  test("renders the spinner correctly", () => {
    render(<Spinner />);
    const spinnerElement = screen.getByLabelText("spinner");
    expect(spinnerElement).toBeInTheDocument();
  });
});
