import { Gauge, Lock } from "lucide-react";
import { formatDurationReadable } from "../utils/format";
import Card from "./Card";

/**
 * Grid of charger power options for a given energy need. Rows where the
 * vehicle cannot accept the charger show "Vehicle limited to X kW" instead of
 * a meaningless time.
 */
export default function ChargingPowerGrid({ options, title = "Charging time by charger" }) {
  const fastest = options
    .filter((o) => !o.limited && Number.isFinite(o.timeHours))
    .sort((a, b) => a.timeHours - b.timeHours)[0];

  return (
    <div>
      {title && (
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-navy/50">
          {title}
        </h3>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {options.map((o) => {
          const isFastest = o === fastest;
          return (
            <Card
              key={o.chargerPower}
              tone={o.limited ? "outline" : "white"}
              className={`relative p-3 ${
                o.limited ? "opacity-70" : isFastest ? "border-lime ring-1 ring-lime" : ""
              }`}
            >
              {isFastest && !o.limited && (
                <span className="absolute -top-2 right-2 rounded bg-lime px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy">
                  Fastest
                </span>
              )}
              <div className="flex items-center gap-1.5 text-navy/60">
                <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="text-sm font-semibold text-navy">{o.chargerPower} kW</span>
              </div>
              {o.limited ? (
                <div className="mt-2 flex items-start gap-1 text-xs leading-snug text-navy/50">
                  <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>Vehicle limited to {o.effectivePower} kW</span>
                </div>
              ) : (
                <p className="mt-2 text-lg font-bold tabular-nums text-navy">
                  ~{formatDurationReadable(o.timeHours)}
                </p>
              )}
              {!o.limited && <p className="mt-0.5 text-xs text-navy/45">est. charging time</p>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}