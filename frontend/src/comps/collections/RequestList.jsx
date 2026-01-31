import { LuCopy, LuEllipsis, LuExternalLink, LuMove, LuPencil, LuTrash, LuGripVertical } from "react-icons/lu";
import { useStore } from "../../store/store";
import { getReqType } from "../../utils/helper";
import { Menu, MenuItem } from "@szhsin/react-menu";
import { useState } from "react";
import RenameReq from "./RenameReq";
import MoveReq from "./MoveReq";
import { toast } from "react-toastify";
import { useDraggable } from "@dnd-kit/core";

const RequestList = ({ req, depth = 0 }) => {
  const [renameModal, setRenameModal] = useState(false);
  const [moveReqModal, setmoveReqModal] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: req.id,
    data: {
      type: 'request',
      req: req,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  const onDeleteReq = async () => {
    let rsp = await useStore.getState().deleteReq(req.coll_id, req.id);
    if (rsp) {
      toast.success("Request deleted successfully!");
    } else {
      toast.error("Error! Cannot delete Request.");
    }
  };

  const paddingLeft = `${depth * 12 + 28}px`;

  return (
    <div
      key={req.id}
      ref={setNodeRef}
      style={{ ...style, paddingLeft }}
      className={`text-txtprim hover:bg-sec hover:text-lit py-1 cursor-pointer group flex items-center ${isDragging ? 'opacity-50' : ''}`}
    >
      <div
        className="mr-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"
        {...listeners}
        {...attributes}
      >
        <LuGripVertical size="16" />
      </div>
      <div className="grow overflow-hidden flex items-center" onClick={() => useStore.getState().openTab(req)}>
        <div className="mr-2 text-xs">{getReqType(req.method)}</div>
        <p className="truncate whitespace-nowrap overflow-ellipsis text-sm" style={{ width: "90%" }}>
          {req.name}
        </p>
      </div>
      <Menu
        menuButton={({ open }) => (
          <div className={`${open ? "block" : "hidden"} group-hover:block pr-2`}>
            <div className="cursor-pointer hover:text-lit">
              <LuEllipsis size="20" />
            </div>
          </div>
        )}
        menuClassName="!bg-sec"
        unmountOnClose={false}
        align="start"
        direction="bottom"
        gap={0}
      >
        <MenuItem className="text-txtprim text-sm gap-x-2" onClick={() => useStore.getState().openTab(req)}>
          <LuExternalLink />
          Open in Tab
        </MenuItem>
        <MenuItem className="text-txtprim text-sm gap-x-2" onClick={() => setRenameModal(true)}>
          <LuPencil />
          Rename
        </MenuItem>
        <MenuItem className="text-txtprim text-sm gap-x-2" onClick={() => useStore.getState().onDuplicateReq(req.coll_id, req.id)}>
          <LuCopy />
          Duplicate
        </MenuItem>
        <MenuItem className="text-txtprim text-sm gap-x-2" onClick={() => setmoveReqModal(true)}>
          <LuMove />
          Move
        </MenuItem>
        <MenuItem className="text-red-400 text-sm gap-x-2" onClick={() => onDeleteReq()}>
          <LuTrash />
          Delete
        </MenuItem>
      </Menu>
      {renameModal && <RenameReq renameModal={renameModal} setRenameModal={setRenameModal} req={req} />}
      {moveReqModal && <MoveReq moveModal={moveReqModal} setmoveModal={setmoveReqModal} req_id={req.id} coll_id={req.coll_id} />}
    </div>
  );
};

export default RequestList;
