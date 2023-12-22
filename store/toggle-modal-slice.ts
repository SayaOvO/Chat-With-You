import {
  Channel,
  ChannelType,
  Profile,
  ServerWithMemberAndChannel
} from "@/types";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type ModalType =
  | "createServer"
  | "invitePeople"
  | "editServer"
  | "manageMember"
  | "createChannel"
  | "deleteServer"
  | "leaveServer"
  | "editChannel"
  | "deleteChannel"
  | "deleteMessage";
type ModalData = {
  server?: Omit<ServerWithMemberAndChannel, "createdAt">;
  profile?: Profile;
  channelType?: ChannelType;
  channel?: Channel;
  query?: Record<string, string>;
  apiUrl?: string;
};
export interface ModalState {
  open: boolean;
  type?: ModalType;
  data?: ModalData;
  // onOpen: (type: ModalType, data?: ModalData) => void;
  // onClose: () => void;
}

const initialState: ModalState = {
  open: false,
  // type: null,
  // data: {},
  // onOpen: (type, data = {}) => {},
  // onClose: () => {}
};

export const modalSlice = createSlice({
  name: "toggleModal",
  initialState,
  reducers: {
    toggleCreateServerModal: (
      state,
      action: PayloadAction<Omit<ModalState, "data">>
    ) => {
      if (action.payload.open) {
        state.open = true;
        state.type = "createServer";
      } else {
        state.open = false;
      }
    },
    toggleInvitePeople: (state, action: PayloadAction<ModalState>) => {
      if (action.payload.open && action.payload.data) {
        state.open = true;
        state.type = "invitePeople";
        state.data = { server: action.payload.data.server };
      } else {
        state.open = false;
      }
    },
    toggleEditServer: (state, action: PayloadAction<ModalState>) => {
      if (action.payload.open && action.payload.data) {
        state.open = true;
        state.type = "editServer";
        state.data = { server: action.payload.data.server };
      } else {
        state.open = false;
      }
    },
    toggleManageMember: (state, action: PayloadAction<ModalState>) => {
      if (action.payload.open && action.payload.data) {
        state.open = true;
        state.type = "manageMember";
        state.data = { ...action.payload.data };
      } else {
        state.open = false;
      }
    },
    toggleCreateChannel: (state, action: PayloadAction<ModalState>) => {
      if (action.payload.open && action.payload.data) {
        state.open = true;
        state.type = "createChannel";
        state.data = { ...action.payload.data };
      } else {
        state.open = false;
      }
    },
    toggleDeleteServer: (state, action: PayloadAction<ModalState>) => {
      if (action.payload.open && action.payload.data) {
        state.open = true;
        state.type = "deleteServer";
        state.data = { ...action.payload.data };
      } else {
        state.open = false;
      }
    },
    toggleLeaveServer: (state, action: PayloadAction<ModalState>) => {
      if (action.payload.open && action.payload.data) {
        state.open = true;
        state.type = "leaveServer";
        state.data = { ...action.payload.data };
      } else {
        state.open = false;
      }
    },
    toggleEditChannel: (state, action: PayloadAction<ModalState>) => {
      if (action.payload.open && action.payload.data) {
        state.open = true;
        state.type = "editChannel";
        state.data = { ...action.payload.data };
      } else {
        state.open = false;
      }
    },
    toggleDeleteChannel: (state, action: PayloadAction<ModalState>) => {
      if (action.payload.open && action.payload.data) {
        state.open = true;
        state.type = "deleteChannel";
        state.data = { ...action.payload.data };
      } else {
        state.open = false;
      }
    },
    toggleDeleteMessage: (state, action: PayloadAction<ModalState>) => {
      if (action.payload.open && action.payload.data) {
        state.open = true;
        state.type = "deleteMessage";
        state.data = { ...action.payload.data };
      } else {
        state.open = false;
      }
    },
  },
});

export const {
  toggleCreateServerModal,
  toggleInvitePeople,
  toggleEditServer,
  toggleManageMember,
  toggleCreateChannel,
  toggleDeleteServer,
  toggleLeaveServer,
  toggleEditChannel,
  toggleDeleteChannel,
  toggleDeleteMessage,
} = modalSlice.actions;
export default modalSlice.reducer;
