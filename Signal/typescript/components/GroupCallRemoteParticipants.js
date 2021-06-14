require(exports => {
    "use strict";
    // Copyright 2020-2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }));
    var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    });
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GroupCallRemoteParticipants = void 0;
    const react_1 = __importStar(require("react"));
    const react_measure_1 = __importDefault(require("react-measure"));
    const lodash_1 = require("lodash");
    const GroupCallRemoteParticipant_1 = require("./GroupCallRemoteParticipant");
    const GroupCallOverflowArea_1 = require("./GroupCallOverflowArea");
    const useGetCallingFrameBuffer_1 = require("../calling/useGetCallingFrameBuffer");
    const hooks_1 = require("../util/hooks");
    const nonRenderedRemoteParticipant_1 = require("../util/ringrtc/nonRenderedRemoteParticipant");
    const MIN_RENDERED_HEIGHT = 180;
    const PARTICIPANT_MARGIN = 10;
    // We scale our video requests down for performance. This number is somewhat arbitrary.
    const VIDEO_REQUEST_SCALAR = 0.75;
    // This component lays out group call remote participants. It uses a custom layout
    //   algorithm (in other words, nothing that the browser provides, like flexbox) in
    //   order to animate the boxes as they move around, and to figure out the right fits.
    //
    // It's worth looking at the UI (or a design of it) to get an idea of how it works. Some
    //   things to notice:
    //
    // * Participants are arranged in 0 or more rows.
    // * Each row is the same height, but each participant may have a different width.
    // * It's possible, on small screens with lots of participants, to have participants
    //   removed from the grid. This is because participants have a minimum rendered height.
    //
    // There should be more specific comments throughout, but the high-level steps are:
    //
    // 1. Figure out the maximum number of possible rows that could fit on the screen; this is
    //    `maxRowCount`.
    // 2. Split the participants into two groups: ones in the main grid and ones in the
    //    overflow area. The grid should prioritize participants who have recently spoken.
    // 3. For each possible number of rows (starting at 0 and ending at `maxRowCount`),
    //    distribute participants across the rows at the minimum height. Then find the
    //    "scalar": how much can we scale these boxes up while still fitting them on the
    //    screen? The biggest scalar wins as the "best arrangement".
    // 4. Lay out this arrangement on the screen.
    const GroupCallRemoteParticipants = ({ getGroupCallVideoFrameSource, i18n, remoteParticipants, setGroupCallVideoRequest, }) => {
        const [containerDimensions, setContainerDimensions] = react_1.useState({
            width: 0,
            height: 0,
        });
        const [gridDimensions, setGridDimensions] = react_1.useState({
            width: 0,
            height: 0,
        });
        const isPageVisible = hooks_1.usePageVisibility();
        const getFrameBuffer = useGetCallingFrameBuffer_1.useGetCallingFrameBuffer();
        // 1. Figure out the maximum number of possible rows that could fit on the screen.
        //
        // We choose the smaller of these two options:
        //
        // - The number of participants, which means there'd be one participant per row.
        // - The number of possible rows in the container, assuming all participants were
        //   rendered at minimum height. Doesn't rely on the number of participants—it's some
        //   simple division.
        //
        // Could be 0 if (a) there are no participants (b) the container's height is small.
        const maxRowCount = Math.min(remoteParticipants.length, Math.floor(containerDimensions.height / (MIN_RENDERED_HEIGHT + PARTICIPANT_MARGIN)));
        // 2. Split participants into two groups: ones in the main grid and ones in the overflow
        //   sidebar.
        //
        // We start by sorting by `speakerTime` so that the most recent speakers are first in
        //   line for the main grid. Then we split the list in two: one for the grid and one for
        //   the overflow area.
        //
        // Once we've sorted participants into their respective groups, we sort them on
        //   something stable (the `demuxId`, but we could choose something else) so that people
        //   don't jump around within the group.
        //
        // These are primarily memoized for clarity, not performance.
        const sortedParticipants = react_1.useMemo(() => remoteParticipants
            .concat()
            .sort((a, b) => (b.speakerTime || -Infinity) - (a.speakerTime || -Infinity)), [remoteParticipants]);
        const gridParticipants = react_1.useMemo(() => {
            // Imagine that we laid out all of the rows end-to-end. That's the maximum total
            //   width. So if there were 5 rows and the container was 100px wide, then we can't
            //   possibly fit more than 500px of participants.
            const maxTotalWidth = maxRowCount * containerDimensions.width;
            // We do the same thing for participants, "laying them out end-to-end" until they
            //   exceed the maximum total width.
            let totalWidth = 0;
            return lodash_1.takeWhile(sortedParticipants, remoteParticipant => {
                totalWidth += remoteParticipant.videoAspectRatio * MIN_RENDERED_HEIGHT;
                return totalWidth < maxTotalWidth;
            }).sort(stableParticipantComparator);
        }, [maxRowCount, containerDimensions.width, sortedParticipants]);
        const overflowedParticipants = react_1.useMemo(() => sortedParticipants
            .slice(gridParticipants.length)
            .sort(stableParticipantComparator), [sortedParticipants, gridParticipants.length]);
        // 3. For each possible number of rows (starting at 0 and ending at `maxRowCount`),
        //   distribute participants across the rows at the minimum height. Then find the
        //   "scalar": how much can we scale these boxes up while still fitting them on the
        //   screen? The biggest scalar wins as the "best arrangement".
        const gridArrangement = react_1.useMemo(() => {
            let bestArrangement = {
                scalar: -1,
                rows: [],
            };
            if (!gridParticipants.length) {
                return bestArrangement;
            }
            for (let rowCount = 1; rowCount <= maxRowCount; rowCount += 1) {
                // We do something pretty naïve here and chunk the grid's participants into rows.
                //   For example, if there were 12 grid participants and `rowCount === 3`, there
                //   would be 4 participants per row.
                //
                // This naïve chunking is suboptimal in terms of absolute best fit, but it is much
                //   faster and simpler than trying to do this perfectly. In practice, this works
                //   fine in the UI from our testing.
                const numberOfParticipantsInRow = Math.ceil(gridParticipants.length / rowCount);
                const rows = lodash_1.chunk(gridParticipants, numberOfParticipantsInRow);
                // We need to find the scalar for this arrangement. Imagine that we have these
                //   participants at the minimum heights, and we want to scale everything up until
                //   it's about to overflow.
                //
                // We don't want it to overflow horizontally or vertically, so we calculate a
                //   "width scalar" and "height scalar" and choose the smaller of the two. (Choosing
                //   the LARGER of the two could cause overflow.)
                const widestRow = lodash_1.maxBy(rows, totalRemoteParticipantWidthAtMinHeight);
                if (!widestRow) {
                    window.log.error('Unable to find the widest row, which should be impossible');
                    continue;
                }
                const widthScalar = (gridDimensions.width - (widestRow.length + 1) * PARTICIPANT_MARGIN) /
                    totalRemoteParticipantWidthAtMinHeight(widestRow);
                const heightScalar = (gridDimensions.height - (rowCount + 1) * PARTICIPANT_MARGIN) /
                    (rowCount * MIN_RENDERED_HEIGHT);
                const scalar = Math.min(widthScalar, heightScalar);
                // If this scalar is the best one so far, we use that.
                if (scalar > bestArrangement.scalar) {
                    bestArrangement = { scalar, rows };
                }
            }
            return bestArrangement;
        }, [
            gridParticipants,
            maxRowCount,
            gridDimensions.width,
            gridDimensions.height,
        ]);
        // 4. Lay out this arrangement on the screen.
        const gridParticipantHeight = Math.floor(gridArrangement.scalar * MIN_RENDERED_HEIGHT);
        const gridParticipantHeightWithMargin = gridParticipantHeight + PARTICIPANT_MARGIN;
        const gridTotalRowHeightWithMargin = gridParticipantHeightWithMargin * gridArrangement.rows.length;
        const gridTopOffset = Math.floor((gridDimensions.height - gridTotalRowHeightWithMargin) / 2);
        const rowElements = gridArrangement.rows.map((remoteParticipantsInRow, index) => {
            const top = gridTopOffset + index * gridParticipantHeightWithMargin;
            const totalRowWidthWithoutMargins = totalRemoteParticipantWidthAtMinHeight(remoteParticipantsInRow) *
                gridArrangement.scalar;
            const totalRowWidth = totalRowWidthWithoutMargins +
                PARTICIPANT_MARGIN * (remoteParticipantsInRow.length - 1);
            const leftOffset = Math.floor((gridDimensions.width - totalRowWidth) / 2);
            let rowWidthSoFar = 0;
            return remoteParticipantsInRow.map(remoteParticipant => {
                const renderedWidth = Math.floor(remoteParticipant.videoAspectRatio * gridParticipantHeight);
                const left = rowWidthSoFar + leftOffset;
                rowWidthSoFar += renderedWidth + PARTICIPANT_MARGIN;
                return (react_1.default.createElement(GroupCallRemoteParticipant_1.GroupCallRemoteParticipant, { key: remoteParticipant.demuxId, getFrameBuffer: getFrameBuffer, getGroupCallVideoFrameSource: getGroupCallVideoFrameSource, height: gridParticipantHeight, i18n: i18n, left: left, remoteParticipant: remoteParticipant, top: top, width: renderedWidth }));
            });
        });
        react_1.useEffect(() => {
            if (isPageVisible) {
                setGroupCallVideoRequest([
                    ...gridParticipants.map(participant => {
                        if (participant.hasRemoteVideo) {
                            return {
                                demuxId: participant.demuxId,
                                width: Math.floor(gridParticipantHeight *
                                    participant.videoAspectRatio *
                                    VIDEO_REQUEST_SCALAR),
                                height: Math.floor(gridParticipantHeight * VIDEO_REQUEST_SCALAR),
                            };
                        }
                        return nonRenderedRemoteParticipant_1.nonRenderedRemoteParticipant(participant);
                    }),
                    ...overflowedParticipants.map(participant => {
                        if (participant.hasRemoteVideo) {
                            return {
                                demuxId: participant.demuxId,
                                width: Math.floor(GroupCallOverflowArea_1.OVERFLOW_PARTICIPANT_WIDTH * VIDEO_REQUEST_SCALAR),
                                height: Math.floor((GroupCallOverflowArea_1.OVERFLOW_PARTICIPANT_WIDTH / participant.videoAspectRatio) *
                                    VIDEO_REQUEST_SCALAR),
                            };
                        }
                        return nonRenderedRemoteParticipant_1.nonRenderedRemoteParticipant(participant);
                    }),
                ]);
            }
            else {
                setGroupCallVideoRequest(remoteParticipants.map(nonRenderedRemoteParticipant_1.nonRenderedRemoteParticipant));
            }
        }, [
            gridParticipantHeight,
            isPageVisible,
            overflowedParticipants,
            remoteParticipants,
            setGroupCallVideoRequest,
            gridParticipants,
        ]);
        return (react_1.default.createElement(react_measure_1.default, {
            bounds: true, onResize: ({ bounds }) => {
                if (!bounds) {
                    window.log.error('We should be measuring the bounds');
                    return;
                }
                setContainerDimensions(bounds);
            }
        }, containerMeasure => (react_1.default.createElement("div", { className: "module-ongoing-call__participants", ref: containerMeasure.measureRef },
            react_1.default.createElement(react_measure_1.default, {
                bounds: true, onResize: ({ bounds }) => {
                    if (!bounds) {
                        window.log.error('We should be measuring the bounds');
                        return;
                    }
                    setGridDimensions(bounds);
                }
            }, gridMeasure => (react_1.default.createElement("div", { className: "module-ongoing-call__participants__grid", ref: gridMeasure.measureRef }, lodash_1.flatten(rowElements)))),
            react_1.default.createElement(GroupCallOverflowArea_1.GroupCallOverflowArea, { getFrameBuffer: getFrameBuffer, getGroupCallVideoFrameSource: getGroupCallVideoFrameSource, i18n: i18n, overflowedParticipants: overflowedParticipants })))));
    };
    exports.GroupCallRemoteParticipants = GroupCallRemoteParticipants;
    function totalRemoteParticipantWidthAtMinHeight(remoteParticipants) {
        return remoteParticipants.reduce((result, { videoAspectRatio }) => result + videoAspectRatio * MIN_RENDERED_HEIGHT, 0);
    }
    function stableParticipantComparator(a, b) {
        return a.demuxId - b.demuxId;
    }
});