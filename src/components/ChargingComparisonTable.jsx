import { AlertTriangle, Lock } from "lucide-react";
import { formatDurationReadable, formatINR, formatKwh } from "../utils/format";

/**
 * Trip charging comparison — a table comparing charger powers pick-up-to-pick-up.
 * Scrolls horizontally on narrow screens.
 */
const thClass = "px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-navy/50";
const tdClass = "px-4 py-3 text-sm tabular-nums text-navy";

export default function ChargingComparisonTable({ rows }) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[560px] border-separate border-spacing-0">
        <caption className="sr-only">Charging comparison across charger powers</caption>
        <thead>
          <tr className="bg-navy/[0.03]">
            <th scope="col" className={`${thClass} rounded-tl-lg`}>Charger</th>
            <th scope="col" className={`${thClass} rounded-tr-lg`}>Est. charging time</th>
            <th scope="col" className={thClass}>Stops</th>
            <th scope="col" className={thClass}>Energy</th>
            <th scope="col" className={thClass}>Cost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.chargerPower} className={r.limited ? "bg-offwhite/60" : "odd:bg-white"}>
              <td className={`${tdClass} font-semibold ${r.limited ? "text-navy/55" : ""}`}>
                {r.chargerPower} kW
              </td>
              <td className={tdClass}>
                {r.limited ? (
                  <span className="inline-flex items-center gap-1 text-xs text-navy/55">
                    <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
                    Vehicle limited to {r.effectivePower} kW
                  </span>
                ) : (
                  <span className="font-semibold">~{formatDurationReadable(r.timeHours)}</span>
                )}
              </td>
              <td className={`${tdClass} ${r.limited ? "text-navy/55" : ""}`}>
                {r.limited ? "—" : r.stops}
              </td>
              <td className={`${tdClass} ${r.limited ? "text-navy/55" : ""}`}>
                {r.limited ? "—" : formatKwh(r.energy)}
              </td>
              <td className={`${tdClass} ${r.limited ? "text-navy/55" : ""}`}>
                {r.limited ? "—" : formatINR(r.cost)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 flex items-start gap-1.5 px-1 text-xs leading-relaxed text-navy/55">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime-dark" aria-hidden="true" />
        Theoretical estimate: power drops as the battery nears a high state of
        charge, so real fast-charging sessions usually take longer.
      </p>
    </div>
  );
}