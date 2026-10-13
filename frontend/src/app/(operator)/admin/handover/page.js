import UsagePanel from '../gedung/usage-panel';
import UsageHistoryPanel from '../gedung/usage-history-panel';

export default function HandoverPage() {
  return <div className="mx-auto max-w-6xl"><UsagePanel mode="handover" /><UsageHistoryPanel /></div>;
}
