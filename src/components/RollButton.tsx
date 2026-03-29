type RollButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function RollButton({ onClick, disabled = false }: RollButtonProps) {
  return (
    <button
      className="roll-button"
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      Roll A Belly Card
    </button>
  );
}
