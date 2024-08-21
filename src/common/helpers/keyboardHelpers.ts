export const actionOnEnter = (event: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
        e.preventDefault();
        event();
    }
};
