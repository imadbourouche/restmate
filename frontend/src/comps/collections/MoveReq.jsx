import { toast } from "react-toastify";
import { useStore } from "../../store/store";
import CustomButton from "../misc/CustomButton";
import ModalLayout from "../misc/ModalLayout";
import { useState } from "react";
import { LuInfo } from "react-icons/lu";

// Helper component to recursively render collections
const CollectionTreeItem = ({ col, selcol, setSelcol, currentCollId, depth = 0 }) => {
  if (col.id === currentCollId) return null;

  const paddingLeft = `${depth * 16 + 8}px`;

  return (
    <>
      <div
        className={`${col.id === selcol ? "bg-txtprim text-brand" : "bg-sec text-txtprim"} rounded-sm p-2 cursor-pointer`}
        style={{ paddingLeft }}
        onClick={() => setSelcol(col.id)}
      >
        <p className="text-sm truncate whitespace-nowrap overflow-ellipsis" style={{ maxWidth: "90%" }}>
          {depth > 0 ? "└─ " : ""}{col.name}
        </p>
      </div>
      {col.collections && col.collections.length > 0 &&
        col.collections.map((subCol) => (
          <CollectionTreeItem
            key={subCol.id}
            col={subCol}
            selcol={selcol}
            setSelcol={setSelcol}
            currentCollId={currentCollId}
            depth={depth + 1}
          />
        ))
      }
    </>
  );
};

// Helper to flatten collections for counting
const countAllCollections = (cols, currentCollId) => {
  let count = 0;
  const traverse = (collections) => {
    collections.forEach((col) => {
      if (col.id !== currentCollId) {
        count++;
        if (col.collections && col.collections.length > 0) {
          traverse(col.collections);
        }
      }
    });
  };
  traverse(cols);
  return count;
};

const MoveReq = ({ moveModal, setmoveModal, req_id, coll_id }) => {
  let cLoading = useStore((x) => x.cLoading);
  let cols = useStore((x) => x.collections);
  const [selcol, setSelcol] = useState(null);

  const onMoveReq = async () => {
    if (selcol === coll_id) return;
    if (!selcol || selcol === "") {
      toast.warn("Please select collection.");
      return;
    }
    let rsp = await useStore.getState().moveReq(req_id, coll_id, selcol);
    if (rsp) {
      setmoveModal(false);
      toast.success("Request moved successfully!");
    } else {
      toast.error("Error! Cannot move Request.");
    }
  };

  const availableCollections = cols && cols.length ? countAllCollections(cols, coll_id) : 0;

  return (
    <ModalLayout open={moveModal} onClose={() => setmoveModal(false)} title="Move Request">
      <div className="p-6">
        <div className="">
          <p className="text-txtprim text-sm">Select Collection</p>
        </div>
        {availableCollections > 0 ? (
          <div className="bg-sec mt-2 border border-lines overflow-y-auto" style={{ maxHeight: "300px" }}>
            {cols.map((col) => (
              <CollectionTreeItem
                key={col.id}
                col={col}
                selcol={selcol}
                setSelcol={setSelcol}
                currentCollId={coll_id}
              />
            ))}
          </div>
        ) : (
          <div className="bg-sec mt-2 p-4 border border-lines rounded-sm">
            <div className="flex justify-center mb-1 text-orange-400">
              <LuInfo size="22" />
            </div>
            <p className="text-txtprim text-sm text-center">No collections found.</p>
            <p className="text-txtprim text-sm text-center">Please create a new collection first.</p>
          </div>
        )}
        <div className="w-full flex justify-end items-center mt-6 gap-x-4">
          <CustomButton name="Move" type="submit" loading={cLoading} clx="px-4 py-1" onClick={onMoveReq} />
          <CustomButton name="Close" bg="bg-txtsec" clx="px-4 py-1" onClick={() => setmoveModal(false)} />
        </div>
      </div>
    </ModalLayout>
  );
};

export default MoveReq;
