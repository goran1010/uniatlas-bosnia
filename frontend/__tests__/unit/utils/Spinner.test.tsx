import { Spinner } from "../../../src/utils/Spinner";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

describe("Spinner component", () => {
  test("renders the spinner correctly", () => {
    render(<Spinner />);
    const spinnerElement = screen.getByLabelText("spinner");
    expect(spinnerElement).toBeInTheDocument();
  });
});
