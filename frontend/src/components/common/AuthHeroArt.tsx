export function AuthHeroArt() {
  return (
    <div
      aria-hidden="true"
      className="relative hidden overflow-hidden rounded-3xl bg-linear-to-br from-cornflower via-royal to-navy lg:block"
    >
      {/* Soft background glows */}
      <div className="absolute -top-24 -right-16 h-96 w-96 rounded-full bg-navy/60 blur-3xl" />
      <div className="absolute top-1/3 -left-24 h-96 w-96 rounded-full bg-cornflower/70 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-ink/60 blur-3xl" />

      {/* Wavy lower layers */}
      <div className="absolute -right-1/4 -bottom-1/4 h-3/4 w-[150%] rounded-[50%] bg-linear-to-tr from-ink via-navy to-royal opacity-95 blur-md" />
      <div className="absolute -bottom-1/3 -left-1/4 h-2/3 w-[120%] rotate-[-8deg] rounded-[50%] bg-linear-to-r from-royal via-navy to-ink opacity-90 blur-sm" />
      <div className="absolute -right-1/3 bottom-[18%] h-1/3 w-[110%] rotate-[-14deg] rounded-[50%] bg-linear-to-r from-transparent via-cornflower/50 to-royal/60 blur-md" />

      {/* Large sphere */}
      <div className="absolute top-[34%] left-[17%] aspect-square w-[55%] rounded-full bg-[radial-gradient(circle_at_70%_25%,#68a4f1_0%,#2b6ad0_40%,#1f4591_75%,#061e47_100%)] shadow-[0_30px_80px_-20px_rgba(6,30,71,0.7)]" />

      {/* Small bubbles */}
      <div className="absolute top-[31%] left-[14%] h-8 w-12 rounded-full bg-linear-to-b from-cornflower to-royal shadow-md" />
      <div className="absolute top-[28%] left-[16%] h-5 w-5 rounded-full bg-linear-to-br from-cornflower to-navy shadow" />
    </div>
  )
}
