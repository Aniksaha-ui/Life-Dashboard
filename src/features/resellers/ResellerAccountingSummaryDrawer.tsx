import { useNavigate, useParams } from "react-router-dom";
import { Drawer } from "../../components/Drawer";

export function ResellerAccountingSummaryDrawer() {
  const { accountingId } = useParams();
  const navigate = useNavigate();

  const onClose = () => {
    navigate("/resellers/accounting");
  };

  return (
    <Drawer
      open={!!accountingId}
      onClose={onClose}
      title="Trans Summary"
      width="4xl"
      noPadding={true}
    >
      <div className="bg-[#f4f7f9] p-8 pb-8 overflow-y-auto custom-scrollbar h-full">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-4 py-16 text-center">
          <p className="text-sm font-medium text-slate-500">
            No Information Found!
          </p>
        </div>
      </div>
    </Drawer>
  );
}
