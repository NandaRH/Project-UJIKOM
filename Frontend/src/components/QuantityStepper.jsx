export default function QuantityStepper({
  value,
  setValue,
  min = 1,
  max = 50,
  step = 1,
  allowFloat = false,
}) {
  const clamp = (input) => Math.min(max, Math.max(min, input));
  const decrease = () =>
    setValue((prev) => clamp(Number((prev - step).toFixed(allowFloat ? 2 : 0))));
  const increase = () =>
    setValue((prev) => clamp(Number((prev + step).toFixed(allowFloat ? 2 : 0))));

  return (
    <div className="inline-flex items-center rounded border">
      <button type="button" onClick={decrease} className="px-3 py-1.5">
        -
      </button>
      <input
        className="w-20 border-x px-2 py-1.5 text-center outline-none"
        value={value}
        onChange={(event) => {
          const raw = event.target.value;
          const parsed = allowFloat ? Number(raw) : parseInt(raw || "0", 10);
          if (Number.isNaN(parsed)) return;
          setValue(clamp(parsed));
        }}
      />
      <button type="button" onClick={increase} className="px-3 py-1.5">
        +
      </button>
    </div>
  );
}
