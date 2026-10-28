import { Drawer } from "../../../components/Drawer";

interface MerchantDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export function MerchantDetailsDrawer({
  open,
  onClose,
  children,
  title,
}: MerchantDetailsDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose} title={title} width="2xl">
      <div className="p-1">{children}</div>
    </Drawer>
  );
}
