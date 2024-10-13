import React from "react";
import Image from "next/image";

const Table = ({ data, liveScores, tableHeader, tableData }) => (
  <div
    className={`text-xs lg:text-base flex-none w-full min-w-[240px] sm:min-w-[280px] md:min-w-[350px] shadow ${
      data[0].league === "nations-league"
        ? "overflow-y-hidden rounded-b-lg rounded-tr-lg"
        : ""
    }`}
  >
    <table className="min-w-full border-gray-300 rounded-lg">
      <thead>
        <tr className="bg-foreground text-background uppercase">
          <th className="py-2 pl-2 sm:pl-5 sm:py-3 text-left">Takım</th>
          {tableHeader.map((header) => (
            <th key={header} className="py-2 sm:py-3 md:px-3 text-center">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.isArray(data) ? (
          data.map((team, idx) => (
            <TableRow
              key={team.team}
              team={team}
              idx={idx}
              liveScores={liveScores}
              tableData={tableData}
            />
          ))
        ) : (
          <tr>
            <td colSpan="9" className="text-center py-4 text-red-500">
              Veri bulunamadı
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

function europeanCompetition(europeanCompetition) {
  switch (europeanCompetition) {
    case "Champions League":
      return "blue-600";
    case "Champions League Qualifiers":
      return "blue-800";
    case "Europa League":
      return "orange-600";
    case "Conference League":
      return "green-600";
    case "Conference League Qualifiers":
      return "green-800";
    default:
      break;
  }
}

function relegationStatus(relegationStatus) {
  switch (relegationStatus) {
    case true:
      return "red-800";
    case "playoff":
      return "orange-700";
    default:
      break;
  }
}

const TableRow = ({ team, idx, liveScores, tableData }) => (
  <tr
    className={`${
      idx % 2 === 0 ? "bg-transparent" : "bg-zinc-800"
    } hover:bg-zinc-700 transition-all`}
  >
    <td className="relative px-1 py-2 sm:px-4 text-white flex items-center gap-2">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-${europeanCompetition(
          team.europeanCompetition
        )} bg-${relegationStatus(team.relegationStatus)}`}
      ></div>
      <span className="text-foreground font-bold ml-1 sm:ml-0 w-5 text-center sm:text-lg">
        {team.rank}
      </span>
      <div className="relative w-7 h-7 my-0.5">
        <Image
          src={team.logo ? team.logo : "/images/nations.svg"}
          alt={`${team.name} Logo`}
          fill
          className={`object-contain ${
            team.team === "Juventus" ? "filter brightness-0 invert" : ""
          } ${team.team === "Antalyaspor" ? "bg-white rounded-full" : ""} `} // Resmin kapsayıcıya göre ayarlanmasını sağlar
        />
      </div>
      <span className="">{team.team}</span>
      {liveScores ? (
        <LiveScoreIndicator team={team} liveScores={liveScores} />
      ) : null}
    </td>
    {tableData.map((key) => (
      <td key={key} className={"px-1 py-2 sm:px-4 text-center"}>
        <span
          className={`${key === "win" ? "text-green-500 font-semibold" : ""} ${
            key === "draw" ? "text-zinc-400 font-semibold" : ""
          }${key === "lose" ? "text-red-500 font-semibold" : ""}`}
        >
          {team[key]}
        </span>
      </td>
    ))}
    <td className="px-1 py-2 sm:px-4 text-center text-white font-bold sm:text-lg">
      {team.point}
    </td>
  </tr>
);

const LiveScoreIndicator = ({ team, liveScores }) => {
  return liveScores
    ? liveScores.map((liveScore) => {
        const isHomeTeam = team.id == liveScore.homeTeam.id;
        const isAwayTeam = team.id == liveScore.awayTeam.id;

        console.log(
          "team: ",
          team.id,
          "live: ",
          liveScore.homeTeam.id,
          liveScore.awayTeam.id
        );
        const [homeScore, awayScore] = liveScore.score.split(":").map(Number);

        if (isHomeTeam || isAwayTeam) {
          const isHalfTime = liveScore.score.split(" ")[1];

          const backgroundColor = getScoreBackgroundColor(
            homeScore,
            awayScore,
            isHomeTeam,
            isAwayTeam,
            isHalfTime
          );
          return (
            <span
              key={liveScore.time}
              className={`px-1.5 py-0.5 font-semibold text-xs md:text-sm rounded-md ml-auto ${backgroundColor}`}
            >
              {liveScore.score.split(" ")[0]}{" "}
              {liveScore.score.split(" ")[1] ? "İY" : null}
            </span>
          );
        }
        return null;
      })
    : null;
};

const getScoreBackgroundColor = (
  homeScore,
  awayScore,
  isHomeTeam,
  isAwayTeam,
  isHalfTime
) => {
  let backgroundColor = "";
  if (homeScore !== awayScore && !isHalfTime) {
    backgroundColor =
      (isHomeTeam && homeScore > awayScore) ||
      (isAwayTeam && awayScore > homeScore)
        ? "bg-green-600"
        : "bg-red-600";
  } else if (isHalfTime) {
    backgroundColor = "bg-gray-500";
  } else {
    backgroundColor = "bg-foreground text-background"; // Beraberlik durumu
  }
  return backgroundColor;
};

export default Table;
