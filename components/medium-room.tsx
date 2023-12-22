"use client";
import "@livekit/components-styles";

import {
  isEqualTrackRef,
  isTrackReference,
  isWeb,
  log,
  TrackReferenceOrPlaceholder,
} from "@livekit/components-core";
import {
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  Toast,
  Chat,
  ChatToggle,
  useCreateLayoutContext,
  LayoutContextProvider,
  WidgetState,
  useConnectionState,
  useRoomContext,
  usePinnedTracks,
  FocusLayoutContainer,
  CarouselLayout,
  FocusLayout,
} from "@livekit/components-react";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { ConnectionState, Track } from "livekit-client";
import { cn } from "@/lib/utils";
import { ControlBar } from "./medium/control-bar";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface MediumRoomProps {
  chatId: string;
  video: boolean;
  channelName: string;
}
export function MediumRoom({ video, chatId, channelName }: MediumRoomProps) {
  const { user } = useUser();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!user?.firstName || !user?.lastName) return;

    const name = `${user?.firstName} ${user?.lastName}`;
    (async () => {
      try {
        const resp = await fetch(
          `/api/get-participant-token?room=${chatId}&username=${name}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);
  if (token === "") {
    return <Toast>Connecting...</Toast>;
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      // Use the default LiveKit theme for nice styles.
      data-lk-theme="default"
      // className="flex"
      // className="flex-1 flex"
      // style={{ height: '100dvh' }}
    >
      <MyVideoConference token={token} channelName={channelName} />
    </LiveKitRoom>
  );
}

function MyVideoConference({
  token,
  channelName,
}: {
  token: string;
  channelName: string;
}) {
  const lastAutoFocusedScreenShareTrack =
    useRef<TrackReferenceOrPlaceholder | null>(null);
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
      // { source: Track.Source.Microphone, withPlaceholder: true}
    ],
    { onlySubscribed: false }
  );
  const layoutContext = useCreateLayoutContext();
  const [widgetState, setWidgetState] = useState<WidgetState>({
    showChat: false,
    unreadMessages: 0,
  });

  const screenShareTracks = tracks
    .filter(isTrackReference)
    .filter((track) => track.publication.source === Track.Source.ScreenShare);

  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const carouselTracks = tracks.filter(
    (track) => !isEqualTrackRef(track, focusTrack)
  );

  const room = useRoomContext();
  const connectionState = useConnectionState(room);

  // auto focus screenshare
  useEffect(() => {
    if (
      screenShareTracks.some((track) => track.publication.isSubscribed) &&
      lastAutoFocusedScreenShareTrack.current === null
    ) {
      layoutContext.pin.dispatch?.({
        msg: "set_pin",
        trackReference: screenShareTracks[0],
      });
      lastAutoFocusedScreenShareTrack.current = screenShareTracks[0];
    } else if (
      lastAutoFocusedScreenShareTrack.current &&
      !screenShareTracks.some(
        (track) =>
          track.publication.trackSid ===
          lastAutoFocusedScreenShareTrack.current?.publication?.trackSid
      )
    ) {
      layoutContext.pin.dispatch?.({ msg: "clear_pin" });
      lastAutoFocusedScreenShareTrack.current = null;
    }
  }, [
    screenShareTracks
      .map(
        (ref) => `${ref.publication.trackSid}_${ref.publication.isSubscribed}`
      )
      .join(),
    focusTrack?.publication?.trackSid,
  ]);

  const widgetUpdate = (state: WidgetState) => {
    log.debug("updating widget state", state);
    setWidgetState(state);
  };

  if (connectionState === ConnectionState.Connecting) {
    return (
      <p className="h-full flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </p>
    );
  }

  if (connectionState === ConnectionState.Disconnected) {
    return (
      <div className="h-full flex items-center justify-center flex-col space-y-4">
        <p className="text-2xl font-semibold">{channelName}</p>
        <p className="text-sm text-primary-foreground/80">
          You leaved the chat, click the button to rejoin!
        </p>
        <Button
          className=" bg-blue-600 text-white rounded-full px-3 py-2
          hover:bg-blue-700 transition"
          onClick={() =>
            room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token)
          }
        >
          Rejoin Voice
        </Button>
      </div>
    );
  }

  return (
    <LayoutContextProvider value={layoutContext} onWidgetChange={widgetUpdate}>
      <p
        className="absolute top-5 z-20 left-[50%] select-none -translate-x-[50%]
      bg-clip-content text-2xl"
      >
        {channelName}
      </p>
        {!focusTrack ? (
          <GridLayout
            tracks={tracks}
            // className="h-full"
            style={{ height: "calc(100% - var(--lk-control-bar-height))" }}
          >
            {/* The GridLayout accepts zero or one child. The child is used
      as a template to render all passed in tracks. */}
      <ParticipantTile />
            {/* <ParticipantTile className="text-sm" style={{ fontSize: 12 }} /> */}
          </GridLayout>
        ) : (
          <div>
            <FocusLayoutContainer>
              <CarouselLayout tracks={carouselTracks}>
                <ParticipantTile />
              </CarouselLayout>
              {focusTrack && <FocusLayout trackRef={focusTrack} />}
            </FocusLayoutContainer>
          </div>
        )}
      <ControlBar variation="verbose" />
      {/* <Chat
        style={{
          // width: "200px",
          display: widgetState.showChat ? "grid" : "none",
        }}
        // style={{
        //   display: widgetState.showChat ? "grid" : "none",
        //   width: "100px"
        // }}
      /> */}
    </LayoutContextProvider>
  );
}
