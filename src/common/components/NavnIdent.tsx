export default function NavnIdent({ navn, ident }: { navn: string; ident: string }) {
    return (
        <>
            <span className="personnavn">{navn}</span> / <span className="ml-1 personident">{ident}</span>
        </>
    );
}
