import * as React from "react";

interface MuscleMapProps {
  fillOverrides?: { [muscleGroupId: string]: string };
  onMuscleClick?: (muscleId: string) => void;
}

const UnifiedMuscleHeatmap = () => {
  // Just return the default grey fill for now
  const getFill = (id: string, defaultColor: string) => defaultColor;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 655 618"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <g transform="translate(-18,-240)">
        {/* // 1/4: Head, chest, abs, shoulders, biceps */}
        <path
          id="neck_anterior"
          style={{ opacity: 0.89, fill: getFill("neck_anterior", "#bfbfbf") }}
          d="m 143,255 9,13 14,8 h 3 l 3,1 13,-1 12,-9 7,-13 -7,48 -15,22 -14,1 -18,-22 z"
        />
        <g id="pectoralis" transform="translate(-106,-2)">
          <path
            style={{ opacity: 0.89, fill: getFill("pectoralis", "#bfbfbf") }}
            d="m 226,325 -25,29 -7,8 7,15 3,9 8,7 12,5 13,3 11,-2 8,-1 11,-8 5,-10 v -19 -13 l -6,-10 -4,-6 z"
          />
          <path
            style={{ opacity: 0.89, fill: getFill("pectoralis", "#bfbfbf") }}
            d="m 334,324 25,29 7,8 -7,15 -3,9 -8,7 -12,5 -13,3 -11,-2 -8,-1 -11,-8 -5,-10 v -19 -13 l 6,-10 4,-6 z"
          />
        </g>

        <g id="rectus_abdominus" transform="translate(-106,-2)">
          <path
            style={{
              opacity: 0.89,
              fill: getFill("rectus_abdominus", "#bfbfbf"),
            }}
            d="m 273,398 4,8 v 12 4 l -3,3 -28,9 -3,-2 -2,-7 9,-14 8,-4 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("rectus_abdominus", "#bfbfbf"),
            }}
            d="m 275,434 1,18 -3,3 -24,5 -7,-3 v -12 l 2,-4 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("rectus_abdominus", "#bfbfbf"),
            }}
            d="m 274,465 1,14 -2,7 -25,3 -5,-7 3,-13 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("rectus_abdominus", "#bfbfbf"),
            }}
            d="m 272,492 4,10 2,73 h -7 l -7,-7 -20,-67 1,-8 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("rectus_abdominus", "#bfbfbf"),
            }}
            d="m 289,400 -4,8 v 12 4 l 3,3 28,9 3,-2 2,-7 -9,-14 -8,-4 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("rectus_abdominus", "#bfbfbf"),
            }}
            d="m 287,436 -1,18 3,3 24,5 7,-3 v -12 l -2,-4 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("rectus_abdominus", "#bfbfbf"),
            }}
            d="m 288,467 -1,14 2,7 25,3 5,-7 -3,-13 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("rectus_abdominus", "#bfbfbf"),
            }}
            d="m 290,494 -4,10 -2,73 h 7 l 7,-7 20,-67 -1,-8 z"
          />
        </g>

        <g id="deltoids_anterior" transform="translate(-106,-2)">
          <path
            style={{
              opacity: 0.89,
              fill: getFill("deltoids_anterior", "#bfbfbf"),
            }}
            d="m 223,319 -18,-5 -14,2 -10,5 -13,12 -6,13 -3,12 1,10 4,18 v 5 l 9,-14 8,-10 8,-8 9,-12 13,-14 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("deltoids_anterior", "#bfbfbf"),
            }}
            d="m 337,318 18,-5 14,2 10,5 13,12 6,13 3,12 -1,10 -4,18 v 5 l -9,-14 -8,-10 -8,-8 -9,-12 -13,-14 z"
          />
        </g>

        <g id="biceps" transform="translate(-106,-2)">
          <path
            style={{ opacity: 0.89, fill: getFill("biceps", "#bfbfbf") }}
            d="m 192,370 6,18 -1,14 -2,13 -4,12 -4,10 -7,11 -7,13 -7,-14 -2,-11 -1,-14 v -12 l 2,-13 5,-12 6,-7 z"
          />
          <path
            style={{ opacity: 0.89, fill: getFill("biceps", "#bfbfbf") }}
            d="m 368,369 -6,18 1,14 2,13 4,12 4,10 7,11 7,13 7,-14 2,-11 1,-14 v -12 l -2,-13 -5,-12 -6,-7 z"
          />
        </g>

        <g id="wrist_flexors" transform="translate(-106,-2)">
          <path
            style={{ opacity: 0.89, fill: getFill("wrist_flexors", "#bfbfbf") }}
            d="m 151,437 6,18 4,17 2,12 10,-18 1,-3 7,10 1,5 -4,15 -6,14 -8,10 -12,25 -2,7 -3,16 -8,-13 -8,1 -7,4 8,-40 -1,-19 2,-15 3,-13 3,-9 8,-14 z"
          />
          <path
            style={{ opacity: 0.89, fill: getFill("wrist_flexors", "#bfbfbf") }}
            d="m 409,436 -6,18 -4,17 -2,12 -10,-18 -1,-3 -7,10 -1,5 4,15 6,14 8,10 12,25 2,7 3,16 8,-13 8,1 7,4 -8,-40 1,-19 -2,-15 -3,-13 -3,-9 -8,-14 z"
          />
        </g>

        {/* // 2/4: Core + Legs (Anterior) */}
        <g id="obliques_anterior" transform="translate(-106,-2)">
          <path
            style={{
              opacity: 0.89,
              fill: getFill("obliques_anterior", "#bfbfbf"),
            }}
            d="m 235,517 2,-21 -4,-19 3,-14 -5,-18 2,-9 -2,-10 4,-19 -24,-8 3,34 4,25 v 13 l -5,26 1,10 11,10 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("obliques_anterior", "#bfbfbf"),
            }}
            d="m 327,519 -2,-21 4,-19 -3,-14 5,-18 -2,-9 2,-10 -4,-19 24,-8 -3,34 -4,25 v 13 l 5,26 -1,10 -11,10 z"
          />
        </g>

        <g id="gluteus_anterior" transform="translate(-106,-2)">
          <path
            style={{
              opacity: 0.89,
              fill: getFill("gluteus_anterior", "#bfbfbf"),
            }}
            d="m 212,511 5,11 3,24 -3,16 -7,17 -12,27 1,-41 5,-24 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("gluteus_anterior", "#bfbfbf"),
            }}
            d="m 348,510 -5,11 -3,24 3,16 7,17 12,27 -1,-41 -5,-24 z"
          />
        </g>

        <g id="quadriceps_anterior" transform="translate(-106,-2)">
          <path
            style={{
              opacity: 0.89,
              fill: getFill("quadriceps_anterior", "#bfbfbf"),
            }}
            d="m 269,592 -3,36 -1,6 4,24 1,5 6,-27 -1,-19 -2,-15 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("quadriceps_anterior", "#bfbfbf"),
            }}
            d="m 291,591 3,36 1,6 -4,24 -1,5 -6,-27 1,-19 2,-15 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("quadriceps_anterior", "#bfbfbf"),
            }}
            d="m 224,526 34,53 10,10 -5,47 5,48 v 32 l -4,24 -13,-13 -8,-12 -14,-2 -3,8 -3,2 -17,-25 -10,-43 2,-33 6,-23 12,-23 7,-19 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("quadriceps_anterior", "#bfbfbf"),
            }}
            d="m 336,525 -34,53 -10,10 5,47 -5,48 v 32 l 4,24 13,-13 8,-12 14,-2 3,8 3,2 17,-25 10,-43 -2,-33 -6,-23 -12,-23 -7,-19 z"
          />
        </g>

        <g
          id="tibialis_anterior"
          transform="matrix(1.1009174,0,0,0.88,-134.70642,84.88)"
        >
          <path
            style={{
              opacity: 0.89,
              fill: getFill("tibialis_anterior", "#bfbfbf"),
            }}
            d="m 239,726 10,22 4,23 1,28 1,38 2,26 1,9 -9,-2 -3,4 -2,-26 -8,-20 -6,-27 -5,-19 v -19 l 1,-20 6,-18 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("tibialis_anterior", "#bfbfbf"),
            }}
            d="m 320,725 -10,22 -4,23 -1,28 -1,38 -2,26 -1,9 9,-2 3,4 2,-26 8,-20 6,-27 5,-19 v -19 l -1,-20 -6,-18 z"
          />
        </g>

        {/* // 3/4: Upper Body (Posterior) */}
        <g id="neck_posterior" transform="translate(-228,-3)">
          <path
            style={{
              opacity: 0.89,
              fill: getFill("neck_posterior", "#bfbfbf"),
            }}
            d="m 713,285 13,-10 8,-13 1,-14 -3,-4 -13,3 -3,4 3,22 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("neck_posterior", "#bfbfbf"),
            }}
            d="m 776,284 -13,-10 -8,-13 -1,-14 3,-4 13,3 3,4 -3,22 z"
          />
        </g>

        <g id="trapezius_posterior" transform="translate(-228,-3)">
          <path
            style={{
              opacity: 0.89,
              fill: getFill("trapezius_posterior", "#bfbfbf"),
            }}
            d="m 739,420 -7,-143 -17,12 -16,9 -17,8 -6,4 17,9 15,7 7,4 -5,5 -4,9 v 8 l 2,10 3,15 18,36 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("trapezius_posterior", "#bfbfbf"),
            }}
            d="m 750,419 7,-143 17,12 16,9 17,8 6,4 -17,9 -15,7 -7,4 5,5 4,9 v 8 l -2,10 -3,15 -18,36 z"
          />
        </g>

        <g id="rear_deltoid" transform="translate(-228,-3)">
          <path
            style={{ opacity: 0.89, fill: getFill("rear_deltoid", "#bfbfbf") }}
            d="m 685,333 -19,-10 -9,-9 -10,4 -7,6 -5,5 -6,9 -5,10 -2,9 v 10 5 l 1,6 h -1 l 2,2 12,-8 7,-3 6,-2 11,-6 9,-7 7,-4 3,-5 3,-5 z"
          />
          <path
            style={{ opacity: 0.89, fill: getFill("rear_deltoid", "#bfbfbf") }}
            d="m 804,332 19,-10 9,-9 10,4 7,6 5,5 6,9 5,10 2,9 v 10 5 l -1,6 h 1 l -2,2 -12,-8 -7,-3 -6,-2 -11,-6 -9,-7 -7,-4 -3,-5 -3,-5 z"
          />
        </g>

        <g id="triceps" transform="translate(-228,-3)">
          <path
            style={{ opacity: 0.89, fill: getFill("triceps", "#bfbfbf") }}
            d="m 642,448 8,-12 8,-20 2,-10 -5,-18 -3,-18 -15,6 -9,8 -6,10 -2,16 -1,14 3,12 v 10 l 1,10 4,-18 2,-2 2,-1 2,1 1,4 z"
          />
          <path
            style={{ opacity: 0.89, fill: getFill("triceps", "#bfbfbf") }}
            d="m 847,447 -8,-12 -8,-20 -2,-10 5,-18 3,-18 15,6 9,8 6,10 2,16 1,14 -3,12 v 10 l -1,10 -4,-18 -2,-2 -2,-1 -2,1 -1,4 z"
          />
        </g>

        <g id="wrist_extensors" transform="translate(-228,-3)">
          <path
            style={{
              opacity: 0.89,
              fill: getFill("wrist_extensors", "#bfbfbf"),
            }}
            d="m 614,469 -10,14 -8,18 -3,24 -3,29 -2,5 10,-7 h 3 l 3,8 4,6 12,-19 8,-23 9,-13 4,-22 v -9 l -1,-4 h -7 l -9,-5 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("wrist_extensors", "#bfbfbf"),
            }}
            d="m 875,468 10,14 8,18 3,24 3,29 2,5 -10,-7 h -3 l -3,8 -4,6 -12,-19 -8,-23 -9,-13 -4,-22 v -9 l 1,-4 h 7 l 9,-5 z"
          />
        </g>

        {/* // 4/4: Lower Body (Posterior) */}
        <g id="gluteus_posterior" transform="translate(-228,-3)">
          <path
            style={{
              opacity: 0.89,
              fill: getFill("gluteus_posterior", "#bfbfbf"),
            }}
            d="m 701,511 -14,5 -6,5 -6,8 -3,14 -2,9 -2,9 -2,13 v 11 l -2,11 5,8 4,12 v 10 2 l 1,3 8,-12 7,-4 h 10 l 13,-2 9,-4 11,-6 8,-9 1,-7 -2,-16 v -12 -13 l -1,-11 -10,-8 -8,-4 -8,-6 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("gluteus_posterior", "#bfbfbf"),
            }}
            d="m 788,510 14,5 6,5 6,8 3,14 2,9 2,9 2,13 v 11 l 2,11 -5,8 -4,12 v 10 2 l -1,3 -8,-12 -7,-4 h -10 l -13,-2 -9,-4 -11,-6 -8,-9 -1,-7 2,-16 v -12 -13 l 1,-11 10,-8 8,-4 8,-6 z"
          />
        </g>

        <g id="hamstrings" transform="translate(-228,-3)">
          <path
            style={{ opacity: 0.89, fill: getFill("hamstrings", "#bfbfbf") }}
            d="m 735,610 -14,5 -13,4 -9,2 h -9 l -9,7 -3,7 -2,4 1,21 1,25 1,22 v 17 l -1,22 v 11 l 7,-11 7,-9 7,-9 6,11 3,8 6,9 7,10 5,-20 2,-21 2,-19 v -14 l 2,-21 2,-22 3,-12 v -13 z"
          />
          <path
            style={{ opacity: 0.89, fill: getFill("hamstrings", "#bfbfbf") }}
            d="m 754,609 14,5 13,4 9,2 h 9 l 9,7 3,7 2,4 -1,21 -1,25 -1,22 v 17 l 1,22 v 11 l -7,-11 -7,-9 -7,-9 -6,11 -3,8 -6,9 -7,10 -5,-20 -2,-21 -2,-19 v -14 l -2,-21 -2,-22 -3,-12 v -13 z"
          />
        </g>

        <g id="quadriceps_posterior" transform="translate(-228,-3)">
          <path
            style={{
              opacity: 0.89,
              fill: getFill("quadriceps_posterior", "#bfbfbf"),
            }}
            d="m 661,599 7,14 1,11 1,20 1,14 1,15 1,15 v 11 6 l -7,-27 -4,-22 -2,-19 1,-16 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("quadriceps_posterior", "#bfbfbf"),
            }}
            d="m 828,598 -7,14 -1,11 -1,20 -1,14 -1,15 -1,15 v 11 6 l 7,-27 4,-22 2,-19 -1,-16 z"
          />
        </g>

        <g id="calves" transform="translate(-228,4)">
          <path
            style={{ opacity: 0.89, fill: getFill("calves", "#bfbfbf") }}
            d="m 693,744 -8,12 -3,6 -2,5 -2,11 -3,8 -2,15 v 12 12 l 2,12 2,8 2,7 h 3 l 2,1 h 5 l 3,-1 1,-3 5,-4 1,-5 4,4 3,5 4,3 4,2 h 3 2 l 3,-4 2,-13 2,-10 v -13 l -2,-13 -3,-14 -1,-9 -1,-6 -5,-9 -7,-8 -7,-9 z"
          />
          <path
            style={{ opacity: 0.89, fill: getFill("calves", "#bfbfbf") }}
            d="m 796,743 8,12 3,6 2,5 2,11 3,8 2,15 v 12 12 l -2,12 -2,8 -2,7 h -3 l -2,1 h -5 l -3,-1 -1,-3 -5,-4 -1,-5 -4,4 -3,5 -4,3 -4,2 h -3 -2 l -3,-4 -2,-13 -2,-10 v -13 l 2,-13 3,-14 1,-9 1,-6 5,-9 7,-8 7,-9 z"
          />
        </g>

        <g id="rhomboids" transform="translate(-228,-3)">
          <path
            style={{ opacity: 0.89, fill: getFill("rhomboids", "#bfbfbf") }}
            d="m 657,368 v 9 l 7,6 11,4 10,1 h 18 l 7,-1 -6,-18 -4,-13 -5,-12 -4,-9 -6,10 -5,6 -6,7 -6,4 z"
          />
          <path
            style={{ opacity: 0.89, fill: getFill("rhomboids", "#bfbfbf") }}
            d="m 832,367 v 9 l -7,6 -11,4 -10,1 h -18 l -7,-1 6,-18 4,-13 5,-12 4,-9 6,10 5,6 6,7 6,4 z"
          />
        </g>

        <g id="lattisimus_dorsi_posterior" transform="translate(-228,-3)">
          <path
            style={{
              opacity: 0.89,
              fill: getFill("lattisimus_dorsi_posterior", "#bfbfbf"),
            }}
            d="m 658,385 17,60 9,14 8,14 9,12 3,13 1,9 8,6 7,5 9,6 7,7 h 3 v -98 l -14,-17 -9,-14 -5,-12 -16,3 -16,-2 -10,-2 z"
          />
          <path
            style={{
              opacity: 0.89,
              fill: getFill("lattisimus_dorsi_posterior", "#bfbfbf"),
            }}
            d="m 831,384 -17,60 -9,14 -8,14 -9,12 -3,13 -1,9 -8,6 -7,5 -9,6 -7,7 h -3 v -98 l 14,-17 9,-14 5,-12 16,3 16,-2 10,-2 z"
          />
        </g>
      </g>
    </svg>
  );
};

export default UnifiedMuscleHeatmap;
