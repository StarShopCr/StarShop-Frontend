
type Props = {
  name: string;
  value: string;
};

export function NFTRewardCard({ name, value }: Props) {
  return (
    <div className="bg-muted/15 text-white px-3 py-3 rounded-xl shadow-md space-y-2">
      <div className="bg-background dark:bg-[#0F0E1D] h-20 rounded-md shadow-inner" />
      <div className="space-y-0.5">
        <p className="text-xs font-semibold truncate">{name}</p>
        <p className="text-[11px] text-[#a259ff]">~{value} XLM</p>
      </div>
    </div>
  );
}
