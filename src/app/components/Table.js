import React from "react";

const Table = ({ data, liveScores, tableHeader, tableData }) => (
  <div className="flex-none w-full min-w-[240px] sm:min-w-[280px] md:min-w-[350px]">
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
              {console.log(data)}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const TableRow = ({ team, idx, liveScores, tableData }) => (
  <tr
    className={`${
      idx % 2 === 0 ? "bg-transparent" : "bg-zinc-800"
    } hover:bg-zinc-700`}
  >
    <td className="px-1 py-2 sm:px-4 text-white flex">
      <span className="text-foreground font-bold w-5 text-center">
        {team.rank}
      </span>
      <span className="ml-1 md:ml-3">{team.team}</span>
      {liveScores ? (
        <LiveScoreIndicator team={team} liveScores={liveScores} />
      ) : null}
    </td>
    {tableData.map((key) => (
      <td key={key} className="px-1 py-2 sm:px-4 text-center">
        {team[key]}
      </td>
    ))}
    <td className="px-1 py-2 sm:px-4 text-center text-white font-bold">
      {team.point}
    </td>
  </tr>
);

const LiveScoreIndicator = ({ team, liveScores }) => {
  return liveScores.map((liveScore) => {
    const isHomeTeam = team.id == liveScore.homeTeam.id;
    const isAwayTeam = team.id == liveScore.awayTeam.id;
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
  });
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
