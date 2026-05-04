const pieces = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: 8 + ((index * 17) % 82),
  delay: (index % 6) * 0.08,
  color: ["#ffcf45", "#3d92f5", "#f55373", "#67c681"][index % 4]
}));

function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          style={
            {
              "--confetti-left": `${piece.left}%`,
              "--confetti-delay": `${piece.delay}s`,
              "--confetti-color": piece.color
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default Confetti;
