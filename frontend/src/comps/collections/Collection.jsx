import { useCollapse } from "react-collapsed";
import { LuChevronDown, LuChevronRight, LuDownload, LuEllipsis, LuPencil, LuPlus, LuTrash, LuFolderPlus } from "react-icons/lu";
import { Menu, MenuItem } from "@szhsin/react-menu";
import RequestList from "./RequestList";
import { useState } from "react";
import RenameCol from "./RenameCol";
import { ExportCollection } from "../../../wailsjs/go/main/App";
import { toast } from "react-toastify";
import { useStore } from "../../store/store";
import { memo } from "react";
import { nanoid } from "nanoid";

const Collection = ({ col, depth = 0 }) => {
  const [renameCol, setRenameCol] = useState(false);
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

  const exportCollection = async () => {
    let rsp = await ExportCollection(col.id);
    if (rsp.success) {
      toast.success("Collection exported successfully!");
    } else {
      toast.error("Error! Cannot export Collection.");
    }
  };

  const onDeleteCol = async () => {
    let rsp = await useStore.getState().deleteCol(col.id);
    if (rsp) {
      toast.success("Collection deleted successfully!");
    } else {
      toast.error("Error! Cannot delete Collection.");
    }
  };

  const onCreateSubCollection = async () => {
    const name = prompt("Enter sub-collection name:");
    if (name && name.trim()) {
      let rsp = await useStore.getState().addColsWithParent({
        id: nanoid(),
        name: name.trim(),
        parent_id: col.id
      });
      if (rsp) {
        toast.success("Sub-collection created successfully!");
      } else {
        toast.error("Error! Cannot create sub-collection.");
      }
    }
  };

  const paddingLeft = `${depth * 12 + 8}px`;

  return (
    <div className="text-txtprim">
      <div
        className={`${isExpanded ? "bg-sec text-lit" : ""} flex items-center py-1 hover:bg-sec hover:text-lit group`}
        style={{ paddingLeft }}
      >
        <div className="pr-1 cursor-pointer" {...getToggleProps()}>
          {isExpanded ? <LuChevronDown size="18" /> : <LuChevronRight size="18" />}
        </div>
        <div className="grow overflow-hidden cursor-pointer" {...getToggleProps()}>
          <p className="truncate whitespace-nowrap overflow-ellipsis text-sm" style={{ width: "90%" }}>
            {col.name}
          </p>
        </div>
        <Menu
          menuButton={({ open }) => (
            <div className={`${open ? "block" : "hidden"} group-hover:block pr-2`}>
              <div className="cursor-pointer text-txtprim hover:text-lit">
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
          <MenuItem className="text-txtprim text-sm gap-x-2" onClick={() => setRenameCol(true)}>
            <LuPencil />
            Rename
          </MenuItem>
          <MenuItem className="text-txtprim text-sm gap-x-2" onClick={() => useStore.getState().addNewReqtoCol(col.id)}>
            <LuPlus />
            Add Request
          </MenuItem>
          <MenuItem className="text-txtprim text-sm gap-x-2" onClick={onCreateSubCollection}>
            <LuFolderPlus />
            Add Sub-Collection
          </MenuItem>
          <MenuItem className="text-txtprim text-sm gap-x-2" onClick={() => exportCollection()}>
            <LuDownload />
            Export
          </MenuItem>
          <MenuItem className="text-red-400 text-sm gap-x-2" onClick={() => onDeleteCol()}>
            <LuTrash />
            Delete
          </MenuItem>
        </Menu>
      </div>
      <section {...getCollapseProps()}>
        {col.requests && col.requests.length ? (
          col.requests.map((a) => <RequestList req={a} key={a.id} depth={depth + 1} />)
        ) : null}
        {col.collections && col.collections.length ? (
          col.collections.map((c) => <Collection col={c} key={c.id} depth={depth + 1} />)
        ) : null}
        {(!col.requests || !col.requests.length) && (!col.collections || !col.collections.length) && (
          <div style={{ paddingLeft: `${(depth + 1) * 12 + 28}px` }}>
            <p className="text-sm text-txtsec">No requests found</p>
          </div>
        )}
      </section>
      {renameCol && <RenameCol renameCol={renameCol} setRenameCol={setRenameCol} col={col} />}
    </div>
  );
};

export default memo(Collection);
