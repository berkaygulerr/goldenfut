import React from "react";

const Tab = ({ item, index, activeTab, handleTabClick }) => {
  return (
    <button
      className={`w-full p-2 sm:p-4 rounded-t-lg ${
        activeTab === index
          ? "bg-foreground font-bold text-background"
          : "bg-background text-zinc-400 hover:bg-zinc-800 focus:bg-zinc-700 transition-all"
      }`}
      onClick={() => handleTabClick(index)}
    >
      {item.lig}
    </button>
  );
};

export default Tab;
