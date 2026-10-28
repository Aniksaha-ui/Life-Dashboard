import { Command } from "cmdk";
import {
  Banknote,
  BarChart2,
  CheckSquare,
  CreditCard,
  FileText,
  Home,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Dispute, Merchant, Transaction } from "../data/mock/types";
import { api } from "../lib/api/client";
import "./command-palette.css";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  useEffect(() => {
    async function loadData() {
      const [m, t, d] = await Promise.all([
        api.merchants.list(),
        api.transactions.list(),
        api.disputes.list(),
      ]);
      setMerchants(m);
      setTransactions(t);
      setDisputes(d);
    }
    loadData();
  }, []);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Global Command Menu"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[640px] w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 p-0"
      shouldFilter={true}
    >
      <div
        className="flex items-center border-b border-slate-100 px-3"
        cmdk-input-wrapper=""
      >
        <Search className="w-5 h-5 text-slate-400 mr-2" />
        <Command.Input
          placeholder="Type a command or search..."
          className="flex-1 h-12 text-sm outline-none placeholder:text-slate-400 text-slate-900"
          value={query}
          onValueChange={setQuery}
        />
      </div>

      <Command.List className="h-[300px] overflow-y-auto overflow-x-hidden p-2">
        <Command.Empty className="py-6 text-center text-sm text-slate-500">
          No results found.
        </Command.Empty>

        {query.length > 0 && (
          <>
            <Command.Group heading="Merchants">
              {merchants.map((m) => (
                <Command.Item
                  key={m.id}
                  value={m.name + " " + m.id}
                  onSelect={() =>
                    runCommand(() => navigate(`/merchants/${m.id}`))
                  }
                >
                  <Users className="mr-2 h-4 w-4" />
                  {m.name} ({m.id})
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Transactions">
              {transactions.map((t) => (
                <Command.Item
                  key={t.id}
                  value={t.id + " " + t.amount}
                  onSelect={() =>
                    runCommand(() => navigate(`/transactions?id=${t.id}`))
                  }
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t.id} - {t.amount} {t.currency}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Disputes">
              {disputes.map((d) => (
                <Command.Item
                  key={d.id}
                  value={d.id}
                  onSelect={() =>
                    runCommand(() => navigate(`/disputes?id=${d.id}`))
                  }
                >
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  {d.id} - {d.amount}
                </Command.Item>
              ))}
            </Command.Group>
          </>
        )}

        <Command.Group heading="Navigation">
          <Command.Item
            onSelect={() => runCommand(() => navigate("/dashboard"))}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate("/work/queue"))}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Work Queue
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate("/merchants"))}
          >
            <Users className="mr-2 h-4 w-4" />
            Merchants
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate("/transactions"))}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Transactions
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate("/disputes"))}
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            Disputes
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate("/settlements"))}
          >
            <Banknote className="mr-2 h-4 w-4" />
            Settlements
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate("/analytics"))}
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Analytics
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate("/investigations"))}
          >
            <Search className="mr-2 h-4 w-4" />
            Investigations
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate("/settings"))}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Actions">
          <Command.Item
            onSelect={() => runCommand(() => console.log("Find merchant"))}
          >
            <Users className="mr-2 h-4 w-4" />
            Find merchant...
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => console.log("Find transaction"))}
          >
            <Search className="mr-2 h-4 w-4" />
            Find transaction...
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate("/transactions/failed"))}
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            Open failed transactions
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate("/investigations"))}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create investigation workspace
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => console.log("Create task"))}
          >
            <FileText className="mr-2 h-4 w-4" />
            Create task
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
