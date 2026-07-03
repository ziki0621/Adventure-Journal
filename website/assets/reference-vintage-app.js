// ../../Downloads/vintage_todo_list_app (1).tsx
import { useState } from "react";
import {
  Menu,
  Diamond,
  Star,
  User,
  Info,
  Settings,
  X,
  Check,
  Plus,
  Trash2,
  Folder,
  Terminal,
  Archive
} from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var ParchmentTexture = () => /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 pointer-events-none z-[-1] bg-[#F3EAD5]", children: [
  /* @__PURE__ */ jsxs("svg", { width: "100%", height: "100%", className: "absolute inset-0 opacity-[0.25] mix-blend-color-burn", children: [
    /* @__PURE__ */ jsxs("filter", { id: "stains", children: [
      /* @__PURE__ */ jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.004", numOctaves: "3" }),
      /* @__PURE__ */ jsx("feColorMatrix", { type: "saturate", values: "0" })
    ] }),
    /* @__PURE__ */ jsx("rect", { width: "100%", height: "100%", filter: "url(#stains)" })
  ] }),
  /* @__PURE__ */ jsxs("svg", { width: "100%", height: "100%", className: "absolute inset-0 opacity-[0.35] mix-blend-multiply", children: [
    /* @__PURE__ */ jsxs("filter", { id: "noise", children: [
      /* @__PURE__ */ jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.8", numOctaves: "3", stitchTiles: "stitch" }),
      /* @__PURE__ */ jsx("feColorMatrix", { type: "saturate", values: "0" })
    ] }),
    /* @__PURE__ */ jsx("rect", { width: "100%", height: "100%", filter: "url(#noise)" })
  ] }),
  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-[0.04]", style: { backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, #4A3B2C 2px, #4A3B2C 4px)" } }),
  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-[0.03]", style: { backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 16px, #4A3B2C 16px, #4A3B2C 18px)" } }),
  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 shadow-[inset_0_0_150px_rgba(74,59,44,0.3)]" }),
  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 shadow-[inset_0_0_40px_rgba(74,59,44,0.1)]" })
] });
var WireframeBox = ({ children, className = "", innerClassName = "", shaded = false, onClick }) => /* @__PURE__ */ jsx(
  "div",
  {
    onClick,
    className: `
      relative border-[1.5px] border-[#4A3B2C] p-[2.5px] 
      shadow-[2px_2px_0px_rgba(74,59,44,0.15)] 
      ${shaded ? "bg-[#E3D4BB]" : "bg-[#F3EAD5]"} 
      ${onClick ? "cursor-pointer hover:bg-[#E3D4BB] transition-colors" : ""}
      ${className}
    `,
    children: /* @__PURE__ */ jsx("div", { className: `border-[0.5px] border-[#4A3B2C] w-full h-full relative ${innerClassName}`, children })
  }
);
var SectionTitle = ({ text }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-6 text-[#4A3B2C] opacity-80", children: [
  /* @__PURE__ */ jsx("span", { className: "text-[6px]", children: "\u25C7" }),
  /* @__PURE__ */ jsx("div", { className: "h-px bg-[#4A3B2C] flex-1" }),
  /* @__PURE__ */ jsx("span", { className: "text-[12px] font-bold tracking-[0.2em] px-1 font-serif-cn", children: text }),
  /* @__PURE__ */ jsx("div", { className: "h-px bg-[#4A3B2C] flex-1" }),
  /* @__PURE__ */ jsx("span", { className: "text-[6px]", children: "\u25C7" })
] });
var ChamferedButton = ({ shaded, children, className = "", onClick }) => /* @__PURE__ */ jsx("div", { onClick, className: `relative group cursor-pointer drop-shadow-[2px_2px_0px_rgba(74,59,44,0.15)] hover:drop-shadow-[1px_1px_0px_rgba(74,59,44,0.15)] active:drop-shadow-none active:translate-y-[2px] active:translate-x-[2px] hover:translate-y-[1px] hover:translate-x-[1px] transition-all w-full h-full select-none ${className}`, children: /* @__PURE__ */ jsx("div", { className: "bg-[#4A3B2C] p-[1.5px] w-full h-full", style: { clipPath: "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)" }, children: /* @__PURE__ */ jsx("div", { className: `${shaded ? "bg-[#E3D4BB]" : "bg-[#F3EAD5]"} group-hover:bg-[#E3D4BB] transition-colors p-[2px] w-full h-full`, style: { clipPath: "polygon(5px 0, calc(100% - 5px) 0, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0 calc(100% - 5px), 0 5px)" }, children: /* @__PURE__ */ jsx("div", { className: "bg-[#4A3B2C] p-[0.5px] w-full h-full", style: { clipPath: "polygon(4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px), 0 4px)" }, children: /* @__PURE__ */ jsx("div", { className: `${shaded ? "bg-[#E3D4BB]" : "bg-[#F3EAD5]"} group-hover:bg-[#E3D4BB] transition-colors w-full h-full flex items-center justify-center`, style: { clipPath: "polygon(3.5px 0, calc(100% - 3.5px) 0, 100% 3.5px, 100% calc(100% - 3.5px), calc(100% - 3.5px) 100%, 3.5px 100%, 0 calc(100% - 3.5px), 0 3.5px)" }, children }) }) }) }) });
var ChamferedTab = ({ active, children, zIndex, onClick }) => /* @__PURE__ */ jsxs("div", { onClick, className: "relative -mr-1 cursor-pointer group select-none", style: { zIndex }, children: [
  /* @__PURE__ */ jsx("div", { className: "bg-[#4A3B2C] p-[1.5px] pb-0", style: { clipPath: "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%, 0 6px)" }, children: /* @__PURE__ */ jsx("div", { className: `${active ? "bg-[#F3EAD5]" : "bg-[#E3D4BB]"} group-hover:bg-[#F3EAD5] transition-colors p-[2px] pb-0`, style: { clipPath: "polygon(5px 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%, 0 5px)" }, children: /* @__PURE__ */ jsx("div", { className: "bg-[#4A3B2C] p-[0.5px] pb-0", style: { clipPath: "polygon(3.5px 0, calc(100% - 3.5px) 0, 100% 3.5px, 100% 100%, 0 100%, 0 3.5px)" }, children: /* @__PURE__ */ jsx("div", { className: `${active ? "bg-[#F3EAD5]" : "bg-[#E3D4BB]"} group-hover:bg-[#F3EAD5] transition-colors min-w-[50px] h-[22px] flex items-center justify-center px-4`, style: { clipPath: "polygon(3px 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%, 0 3px)" }, children }) }) }) }),
  active && /* @__PURE__ */ jsx("div", { className: "absolute -bottom-[1px] left-[1.5px] right-[1.5px] h-[3px] bg-[#F3EAD5] z-10" })
] });
var Sidebar = ({ isOpen, onClose, currentView, onNavigate }) => {
  const handleNav = (id) => {
    onNavigate(id);
    onClose();
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    isOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-[#4A3B2C]/20 z-40 transition-opacity",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `fixed top-0 left-0 h-full w-64 bg-[#F3EAD5] border-r-[1.5px] border-[#4A3B2C] z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0 shadow-[4px_0px_0px_rgba(74,59,44,0.15)]" : "-translate-x-full"}`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "h-16 border-b-[0.5px] border-[#4A3B2C] flex items-center justify-between px-4 bg-[#E3D4BB]", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[12px] font-bold tracking-widest text-[#4A3B2C] font-serif-cn", children: "\u7CFB\u7D71\u5C0E\u822A" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "w-6 h-6 border border-[#4A3B2C] flex items-center justify-center hover:bg-[#D5C4A6] transition-colors focus:outline-none",
                children: /* @__PURE__ */ jsx(X, { size: 14, className: "text-[#4A3B2C]" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 p-4 space-y-2 overflow-y-auto", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[8px] font-bold tracking-widest text-[#4A3B2C] opacity-60 mb-2", children: "\u4E3B\u8981\u76EE\u9304" }),
            [
              { id: "tasks", icon: /* @__PURE__ */ jsx(Terminal, { size: 14 }), label: "\u4EFB\u52D9\u7BA1\u5236\u7D42\u7AEF" },
              { id: "archives", icon: /* @__PURE__ */ jsx(Folder, { size: 14 }), label: "\u6B77\u53F2\u6A94\u6848\u5EAB" },
              { id: "backups", icon: /* @__PURE__ */ jsx(Archive, { size: 14 }), label: "\u7CFB\u7D71\u5099\u4EFD\u5340" }
            ].map((item, idx) => /* @__PURE__ */ jsxs(
              WireframeBox,
              {
                onClick: () => handleNav(item.id),
                className: `w-full group ${currentView === item.id ? "bg-[#E3D4BB]" : ""}`,
                innerClassName: "flex items-center gap-3 p-2 hover:bg-[#E3D4BB]/50 transition-colors cursor-pointer",
                children: [
                  /* @__PURE__ */ jsx("div", { className: `text-[#4A3B2C] ${currentView === item.id ? "" : "opacity-70"}`, children: item.icon }),
                  /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold tracking-widest font-serif-cn ${currentView === item.id ? "text-[#4A3B2C]" : "text-[#4A3B2C] opacity-70"}`, children: item.label })
                ]
              },
              idx
            )),
            /* @__PURE__ */ jsx("div", { className: "text-[8px] font-bold tracking-widest text-[#4A3B2C] opacity-60 mb-2 mt-6", children: "\u7CFB\u7D71\u8A2D\u5B9A" }),
            [
              { id: "users", icon: /* @__PURE__ */ jsx(User, { size: 14 }), label: "\u4F7F\u7528\u8005\u6388\u6B0A" },
              { id: "settings", icon: /* @__PURE__ */ jsx(Settings, { size: 14 }), label: "\u6838\u5FC3\u53C3\u6578\u8ABF\u6574" },
              { id: "logs", icon: /* @__PURE__ */ jsx(Info, { size: 14 }), label: "\u7248\u672C\u8CC7\u8A0A\u65E5\u8A8C" }
            ].map((item, idx) => /* @__PURE__ */ jsxs(
              WireframeBox,
              {
                onClick: () => handleNav(item.id),
                className: `w-full group ${currentView === item.id ? "bg-[#E3D4BB]" : ""}`,
                innerClassName: "flex items-center gap-3 p-2 hover:bg-[#E3D4BB]/50 transition-colors cursor-pointer",
                children: [
                  /* @__PURE__ */ jsx("div", { className: `text-[#4A3B2C] ${currentView === item.id ? "" : "opacity-70"}`, children: item.icon }),
                  /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold tracking-widest font-serif-cn ${currentView === item.id ? "text-[#4A3B2C]" : "text-[#4A3B2C] opacity-70"}`, children: item.label })
                ]
              },
              `sys-${idx}`
            ))
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 border-t-[0.5px] border-[#4A3B2C]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[6px] text-[#4A3B2C]", children: "\u25C7" }),
              /* @__PURE__ */ jsx("div", { className: "h-[0.5px] bg-[#4A3B2C] w-1/3" }),
              /* @__PURE__ */ jsx("span", { className: "text-[6px] text-[#4A3B2C]", children: "\u25C7" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-center mt-2 text-[8px] font-bold tracking-widest text-[#4A3B2C] opacity-50 font-mono", children: "SYS_VER: 1.0.4b" })
          ] })
        ]
      }
    )
  ] });
};
var TodoApp = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "\u555F\u52D5\u9632\u79A6\u77E9\u9663", completed: true },
    { id: 2, text: "\u6821\u6E96\u901A\u8A0A\u5929\u7DDA\u983B\u7387", completed: false },
    { id: 3, text: "\u66F4\u65B0\u6838\u5FC3\u5354\u8B70\u6A21\u584A", completed: false }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState("ALL");
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const filteredTasks = tasks.filter((task) => {
    if (filter === "ACTIVE") return !task.completed;
    if (filter === "COMPLETED") return task.completed;
    return true;
  });
  const addTask = () => {
    if (inputValue.trim() === "") return;
    const newTask = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false
    };
    setTasks([...tasks, newTask]);
    setInputValue("");
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };
  const toggleComplete = (id) => {
    setTasks(tasks.map(
      (task) => task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-8 relative z-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-10 space-y-2", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-serif-cn tracking-[0.5em] font-bold text-[#4A3B2C]", children: "\u4EFB\u52D9\u7BA1\u5236\u7D42\u7AEF" }),
      /* @__PURE__ */ jsx("p", { className: "text-[12px] font-bold tracking-[0.3em] font-serif-cn opacity-70", children: "\u57F7\u884C\u4EFB\u52D9\u5E8F\u5217\u8207\u8FFD\u8E64" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-1 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
          /* @__PURE__ */ jsx(SectionTitle, { text: "\u65B0\u5EFA\u4EFB\u52D9\u6307\u4EE4" }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 mt-2", children: [
            /* @__PURE__ */ jsx(WireframeBox, { className: "h-10 p-0", innerClassName: "flex items-center overflow-hidden bg-white/30 focus-within:bg-[#E3D4BB] transition-colors", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: inputValue,
                onChange: (e) => setInputValue(e.target.value),
                onKeyDown: handleKeyDown,
                placeholder: "\u8F38\u5165\u4EFB\u52D9\u63CF\u8FF0...",
                className: "w-full h-full bg-transparent outline-none pl-3 text-[12px] font-bold font-serif-cn tracking-wider text-[#4A3B2C] placeholder:text-[#4A3B2C] placeholder:opacity-40"
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "h-10 w-full", children: /* @__PURE__ */ jsx(ChamferedButton, { shaded: true, onClick: addTask, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsx(Plus, { size: 14, className: "text-[#4A3B2C]" }),
              /* @__PURE__ */ jsx("span", { className: "text-[#4A3B2C] text-[12px] font-bold font-serif-cn tracking-widest", children: "\u5BEB\u5165\u5E8F\u5217" })
            ] }) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "w-full mt-8", children: [
          /* @__PURE__ */ jsx(SectionTitle, { text: "\u7CFB\u7D71\u72C0\u614B\u5100\u8868" }),
          /* @__PURE__ */ jsxs(WireframeBox, { className: "h-40", innerClassName: "p-4 flex flex-col gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b-[0.5px] border-[#4A3B2C] pb-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-widest text-[#4A3B2C] font-serif-cn opacity-80", children: "\u4EFB\u52D9\u7E3D\u6578" }),
              /* @__PURE__ */ jsx("span", { className: "text-[14px] font-bold text-[#4A3B2C] font-mono", children: totalTasks.toString().padStart(2, "0") })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b-[0.5px] border-[#4A3B2C] pb-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-widest text-[#4A3B2C] font-serif-cn opacity-80", children: "\u5F85\u57F7\u884C" }),
              /* @__PURE__ */ jsx("span", { className: "text-[14px] font-bold text-[#4A3B2C] font-mono", children: activeTasks.toString().padStart(2, "0") })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-widest text-[#4A3B2C] font-serif-cn opacity-80", children: "\u5DF2\u5B8C\u6210" }),
              /* @__PURE__ */ jsx("span", { className: "text-[14px] font-bold text-[#4A3B2C] font-mono", children: completedTasks.toString().padStart(2, "0") })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-auto", children: [
              /* @__PURE__ */ jsx("div", { className: "w-full h-2 border border-[#4A3B2C] bg-[#F3EAD5] relative overflow-hidden", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "absolute top-0 left-0 h-full bg-[#4A3B2C] transition-all duration-500 ease-out",
                  style: { width: totalTasks === 0 ? "0%" : `${completedTasks / totalTasks * 100}%` }
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "text-right text-[8px] mt-1 font-mono text-[#4A3B2C] opacity-70", children: [
                totalTasks === 0 ? "0" : Math.round(completedTasks / totalTasks * 100),
                "% COMPLETION"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-[1.5px] border-dashed border-[#4A3B2C] bg-[#F3EAD5] bg-opacity-50 p-4 flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx(Info, { size: 12, className: "text-[#4A3B2C]" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-widest text-[#4A3B2C] font-serif-cn", children: "\u7CFB\u7D71\u65E5\u8A8C" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold font-serif-cn text-[#4A3B2C] opacity-70 leading-relaxed", children: "\u6240\u6709\u6578\u64DA\u76EE\u524D\u5B58\u5132\u65BC\u672C\u5730\u81E8\u6642\u8A18\u61B6\u9AD4\u4E2D\u3002\u95DC\u9589\u7D42\u7AEF\u5C07\u5C0E\u81F4\u5E8F\u5217\u91CD\u7F6E\u3002" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 space-y-2", children: [
        /* @__PURE__ */ jsx(SectionTitle, { text: "\u7576\u524D\u5E8F\u5217\u5217\u8868" }),
        /* @__PURE__ */ jsxs("div", { className: "relative mt-2 flex flex-col pl-4 mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-end z-10 relative top-[1.5px]", children: [
            /* @__PURE__ */ jsx(ChamferedTab, { active: filter === "ALL", zIndex: filter === "ALL" ? 10 : 3, onClick: () => setFilter("ALL"), children: /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold tracking-widest font-serif-cn transition-opacity ${filter === "ALL" ? "text-[#4A3B2C]" : "text-[#4A3B2C] opacity-50"}`, children: "\u5168\u90E8\u4EFB\u52D9" }) }),
            /* @__PURE__ */ jsx(ChamferedTab, { active: filter === "ACTIVE", zIndex: filter === "ACTIVE" ? 10 : 2, onClick: () => setFilter("ACTIVE"), children: /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold tracking-widest font-serif-cn transition-opacity ${filter === "ACTIVE" ? "text-[#4A3B2C]" : "text-[#4A3B2C] opacity-50"}`, children: "\u5F85\u57F7\u884C" }) }),
            /* @__PURE__ */ jsx(ChamferedTab, { active: filter === "COMPLETED", zIndex: filter === "COMPLETED" ? 10 : 1, onClick: () => setFilter("COMPLETED"), children: /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold tracking-widest font-serif-cn transition-opacity ${filter === "COMPLETED" ? "text-[#4A3B2C]" : "text-[#4A3B2C] opacity-50"}`, children: "\u5DF2\u5B8C\u6210" }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "border-[1.5px] border-[#4A3B2C] w-full h-2 bg-[#F3EAD5] relative z-0" })
        ] }),
        /* @__PURE__ */ jsxs(WireframeBox, { className: "min-h-[400px]", innerClassName: "flex flex-col bg-[#F3EAD5]", children: [
          /* @__PURE__ */ jsxs("div", { className: "h-6 border-b-[0.5px] border-[#4A3B2C] flex items-center px-2 justify-between bg-[#E3D4BB]", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[6px] text-[#4A3B2C]", children: "\u25C7" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-widest text-[#4A3B2C] font-serif-cn", children: "\u5E8F\u5217\u8A18\u9304\u6A94\u6848\u5340" }),
            /* @__PURE__ */ jsx("span", { className: "text-[6px] text-[#4A3B2C]", children: "\u25C7" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 p-2 flex flex-col gap-2 overflow-y-auto max-h-[450px]", children: filteredTasks.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full opacity-50 gap-4 mt-20", children: [
            /* @__PURE__ */ jsx(Diamond, { size: 24, className: "text-[#4A3B2C]" }),
            /* @__PURE__ */ jsx("span", { className: "text-[12px] font-bold tracking-widest text-[#4A3B2C] font-serif-cn", children: "\u6B64\u5206\u985E\u4E0B\u7121\u8A18\u9304\u6578\u64DA" })
          ] }) : filteredTasks.map((task) => /* @__PURE__ */ jsxs(
            WireframeBox,
            {
              className: "w-full shrink-0 group transition-all",
              innerClassName: `p-3 flex items-center justify-between transition-colors ${task.completed ? "bg-[#E3D4BB]/50" : "bg-transparent"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 flex-1 overflow-hidden", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      onClick: () => toggleComplete(task.id),
                      className: "flex items-center justify-center shrink-0 w-5 h-5 border-[1.5px] border-[#4A3B2C] bg-[#F3EAD5] cursor-pointer hover:bg-[#E3D4BB] transition-colors",
                      children: task.completed && /* @__PURE__ */ jsx(Check, { size: 14, strokeWidth: 3, className: "text-[#4A3B2C]" })
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: `text-[12px] font-bold tracking-widest font-serif-cn truncate transition-all ${task.completed ? "text-[#4A3B2C] opacity-50 line-through decoration-[#4A3B2C] decoration-1" : "text-[#4A3B2C]"}`, children: task.text })
                ] }),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    onClick: () => deleteTask(task.id),
                    className: "w-6 h-6 shrink-0 border-[1px] border-transparent group-hover:border-[#4A3B2C] flex items-center justify-center cursor-pointer hover:bg-[#D5C4A6] transition-all opacity-0 group-hover:opacity-100",
                    children: /* @__PURE__ */ jsx(Trash2, { size: 12, className: "text-[#4A3B2C]" })
                  }
                )
              ]
            },
            task.id
          )) })
        ] })
      ] })
    ] })
  ] });
};
var ArchivesView = () => /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-8 relative z-10 animate-in fade-in duration-300", children: [
  /* @__PURE__ */ jsxs("div", { className: "text-center mb-10 space-y-2", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-serif-cn tracking-[0.5em] font-bold text-[#4A3B2C]", children: "\u6B77\u53F2\u6A94\u6848\u5EAB" }),
    /* @__PURE__ */ jsx("p", { className: "text-[12px] font-bold tracking-[0.3em] font-serif-cn opacity-70", children: "\u552F\u8B80\u6B77\u53F2\u8A18\u9304\u8207\u5C01\u5B58\u5E8F\u5217" })
  ] }),
  /* @__PURE__ */ jsx(SectionTitle, { text: "\u5DF2\u5C01\u5B58\u8CC7\u6599\u5377" }),
  /* @__PURE__ */ jsx(WireframeBox, { className: "min-h-[400px]", innerClassName: "p-4 flex flex-col gap-4", children: [
    { id: "ARC-001", date: "2026-06-12", title: "\u6838\u5FC3\u77E9\u9663\u521D\u59CB\u5316\u65E5\u8A8C", status: "SEALED" },
    { id: "ARC-002", date: "2026-06-15", title: "\u901A\u8A0A\u5354\u8B70\u5347\u7D1A\u5099\u5FD8\u9304", status: "SEALED" },
    { id: "ARC-003", date: "2026-06-20", title: "\u5916\u570D\u9632\u79A6\u5931\u6548\u4E8B\u4EF6\u5831\u544A", status: "CLASSIFIED" },
    { id: "ARC-004", date: "2026-06-28", title: "\u4F8B\u884C\u6027\u80FD\u6AA2\u6E2C\u5831\u8868", status: "SEALED" }
  ].map((file) => /* @__PURE__ */ jsxs(WireframeBox, { className: "w-full", innerClassName: "p-3 flex items-center justify-between hover:bg-[#E3D4BB]/50 transition-colors cursor-pointer", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx(Folder, { size: 16, className: "text-[#4A3B2C] opacity-70" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-[12px] font-bold font-mono tracking-widest text-[#4A3B2C]", children: file.id }),
        /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold font-serif-cn text-[#4A3B2C] opacity-70 mt-1", children: file.title })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[10px] font-mono text-[#4A3B2C] opacity-70 mb-1", children: file.date }),
      /* @__PURE__ */ jsx("div", { className: `text-[8px] font-bold tracking-widest px-2 py-0.5 border border-[#4A3B2C] ${file.status === "CLASSIFIED" ? "bg-[#4A3B2C] text-[#F3EAD5]" : "text-[#4A3B2C]"}`, children: file.status })
    ] })
  ] }, file.id)) })
] });
var BackupsView = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [progress, setProgress] = useState(0);
  const triggerBackup = () => {
    if (isBackingUp) return;
    setIsBackingUp(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          return 100;
        }
        return p + 5;
      });
    }, 150);
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-8 relative z-10 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-10 space-y-2", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-serif-cn tracking-[0.5em] font-bold text-[#4A3B2C]", children: "\u7CFB\u7D71\u5099\u4EFD\u5340" }),
      /* @__PURE__ */ jsx("p", { className: "text-[12px] font-bold tracking-[0.3em] font-serif-cn opacity-70", children: "\u6838\u5FC3\u6578\u64DA\u5FEB\u7167\u8207\u9084\u539F" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx(SectionTitle, { text: "\u5099\u4EFD\u63A7\u5236" }),
        /* @__PURE__ */ jsxs(WireframeBox, { className: "h-48", innerClassName: "p-6 flex flex-col items-center justify-center gap-6", children: [
          /* @__PURE__ */ jsx(Archive, { size: 32, className: `text-[#4A3B2C] ${isBackingUp ? "animate-pulse" : ""}` }),
          /* @__PURE__ */ jsx("div", { className: "w-48 h-10", children: /* @__PURE__ */ jsx(ChamferedButton, { shaded: true, onClick: triggerBackup, children: /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-widest uppercase text-[#4A3B2C]", children: isBackingUp ? "\u5099\u4EFD\u57F7\u884C\u4E2D..." : "\u5EFA\u7ACB\u7CFB\u7D71\u5FEB\u7167" }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx(SectionTitle, { text: "\u7576\u524D\u72C0\u614B" }),
        /* @__PURE__ */ jsxs(WireframeBox, { className: "h-48", innerClassName: "p-6 flex flex-col justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2 border-b-[0.5px] border-[#4A3B2C] pb-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-widest text-[#4A3B2C]", children: "\u6700\u5F8C\u5099\u4EFD\u6642\u9593" }),
              /* @__PURE__ */ jsx("span", { className: "text-[12px] font-mono text-[#4A3B2C]", children: "2026.07.01 12:00" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2 border-b-[0.5px] border-[#4A3B2C] pb-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-widest text-[#4A3B2C]", children: "\u6578\u64DA\u5B8C\u6574\u5EA6" }),
              /* @__PURE__ */ jsx("span", { className: "text-[12px] font-mono text-[#4A3B2C]", children: "99.9%" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[8px] font-mono mb-1 text-[#4A3B2C]", children: [
              /* @__PURE__ */ jsx("span", { children: "SYS_BACKUP_PROGRESS" }),
              /* @__PURE__ */ jsxs("span", { children: [
                progress,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-full h-3 border-[1.5px] border-[#4A3B2C] bg-[#F3EAD5] p-[1.5px]", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-[#4A3B2C] transition-all duration-150", style: { width: `${progress}%` } }) })
          ] })
        ] })
      ] })
    ] })
  ] });
};
var UsersView = () => /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-8 relative z-10 animate-in fade-in duration-300", children: [
  /* @__PURE__ */ jsxs("div", { className: "text-center mb-10 space-y-2", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-serif-cn tracking-[0.5em] font-bold text-[#4A3B2C]", children: "\u4F7F\u7528\u8005\u6388\u6B0A" }),
    /* @__PURE__ */ jsx("p", { className: "text-[12px] font-bold tracking-[0.3em] font-serif-cn opacity-70", children: "\u7D42\u7AEF\u64CD\u4F5C\u6B0A\u9650\u7BA1\u7406" })
  ] }),
  /* @__PURE__ */ jsx(SectionTitle, { text: "\u5DF2\u8A3B\u518A\u64CD\u4F5C\u54E1" }),
  /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6", children: [
    { name: "OPR-01 (ROOT)", role: "\u7BA1\u7406\u54E1", active: true },
    { name: "OPR-02", role: "\u6A19\u6E96\u7528\u6236", active: true },
    { name: "GUEST_99", role: "\u8A2A\u5BA2", active: false }
  ].map((user, idx) => /* @__PURE__ */ jsxs(WireframeBox, { className: "h-32", innerClassName: "p-4 flex flex-col justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border border-[#4A3B2C] flex items-center justify-center bg-[#E3D4BB]", children: /* @__PURE__ */ jsx(User, { size: 16, className: "text-[#4A3B2C]" }) }),
      /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full border border-[#4A3B2C] ${user.active ? "bg-[#4A3B2C]" : "bg-transparent"}` })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "text-[12px] font-bold font-mono tracking-widest text-[#4A3B2C]", children: user.name }),
      /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-bold font-serif-cn text-[#4A3B2C] opacity-70 mt-1", children: [
        "\u6B0A\u9650\u7D1A\u5225: ",
        user.role
      ] })
    ] })
  ] }, idx)) })
] });
var SettingsView = () => {
  const [toggles, setToggles] = useState({ t1: true, t2: false, t3: true });
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-8 relative z-10 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-10 space-y-2", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-serif-cn tracking-[0.5em] font-bold text-[#4A3B2C]", children: "\u6838\u5FC3\u53C3\u6578\u8ABF\u6574" }),
      /* @__PURE__ */ jsx("p", { className: "text-[12px] font-bold tracking-[0.3em] font-serif-cn opacity-70", children: "\u7CFB\u7D71\u74B0\u5883\u8207\u884C\u70BA\u504F\u597D" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx(SectionTitle, { text: "\u7CFB\u7D71\u884C\u70BA" }),
        /* @__PURE__ */ jsx(WireframeBox, { className: "h-auto", innerClassName: "p-4 flex flex-col gap-4", children: [
          { id: "t1", label: "\u81EA\u52D5\u5C01\u5B58\u5DF2\u5B8C\u6210\u4EFB\u52D9" },
          { id: "t2", label: "\u958B\u555F\u97F3\u6548\u53CD\u994B (BEEP)" },
          { id: "t3", label: "\u5F37\u5236\u52A0\u5BC6\u901A\u8A0A\u5354\u8B70" }
        ].map((item) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center border-b-[0.5px] border-[#4A3B2C] pb-2 last:border-0 last:pb-0", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-widest text-[#4A3B2C] font-serif-cn", children: item.label }),
          /* @__PURE__ */ jsx(
            "div",
            {
              onClick: () => setToggles((prev) => ({ ...prev, [item.id]: !prev[item.id] })),
              className: `w-8 h-4 rounded-full border-[1px] border-[#4A3B2C] p-[1.5px] flex items-center cursor-pointer transition-colors ${toggles[item.id] ? "bg-[#E3D4BB]" : "bg-[#F3EAD5]"}`,
              children: /* @__PURE__ */ jsx("div", { className: `w-2.5 h-2.5 rounded-full border border-[#4A3B2C] transition-all transform ${toggles[item.id] ? "translate-x-4 bg-[#4A3B2C]" : "translate-x-0 bg-[#E3D4BB]"}` })
            }
          )
        ] }, item.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx(SectionTitle, { text: "\u986F\u793A\u8A2D\u5B9A" }),
        /* @__PURE__ */ jsxs(WireframeBox, { className: "h-auto", innerClassName: "p-4 flex flex-col gap-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-widest text-[#4A3B2C] mb-2 block font-serif-cn", children: "\u5C0D\u6BD4\u5EA6\u8ABF\u6574" }),
            /* @__PURE__ */ jsx("div", { className: "w-full h-2 border-[1.5px] border-[#4A3B2C] bg-[#E3D4BB] relative cursor-ew-resize", children: /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 -translate-y-1/2 left-1/2 w-2 h-4 bg-[#4A3B2C] border-[0.5px] border-[#F3EAD5]" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-widest text-[#4A3B2C] mb-2 block font-serif-cn", children: "\u7D42\u7AEF\u6A5F\u6A19\u7C64\u540D" }),
            /* @__PURE__ */ jsx(WireframeBox, { className: "h-8 p-0", innerClassName: "bg-white/30 focus-within:bg-[#E3D4BB] transition-colors", children: /* @__PURE__ */ jsx("input", { type: "text", defaultValue: "MAIN_TERMINAL_01", className: "w-full h-full bg-transparent outline-none pl-2 text-[10px] font-mono text-[#4A3B2C]" }) })
          ] })
        ] })
      ] })
    ] })
  ] });
};
var LogsView = () => /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-8 relative z-10 animate-in fade-in duration-300", children: [
  /* @__PURE__ */ jsxs("div", { className: "text-center mb-10 space-y-2", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-serif-cn tracking-[0.5em] font-bold text-[#4A3B2C]", children: "\u7248\u672C\u8CC7\u8A0A\u65E5\u8A8C" }),
    /* @__PURE__ */ jsx("p", { className: "text-[12px] font-bold tracking-[0.3em] font-serif-cn opacity-70", children: "\u7D42\u7AEF\u6D3B\u52D5\u8207\u6838\u5FC3\u4EE3\u78BC\u8FFD\u8E64" })
  ] }),
  /* @__PURE__ */ jsx(SectionTitle, { text: "TERMINAL_STDOUT" }),
  /* @__PURE__ */ jsxs(WireframeBox, { className: "h-64", innerClassName: "bg-[#E3D4BB] p-2 relative overflow-hidden flex flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 pointer-events-none opacity-20", style: { backgroundImage: "repeating-linear-gradient(transparent, transparent 2px, #4A3B2C 2px, #4A3B2C 4px)" } }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto font-mono text-[10px] text-[#4A3B2C] space-y-1 p-2 relative z-10", children: [
      /* @__PURE__ */ jsx("p", { className: "opacity-70", children: "> SYSTEM BOOT SEQUENCE INITIATED..." }),
      /* @__PURE__ */ jsx("p", { className: "opacity-70", children: "> LOADING MODULES [\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588] 100%" }),
      /* @__PURE__ */ jsx("p", { className: "opacity-70", children: "> MOUNTING FILESYSTEM... OK" }),
      /* @__PURE__ */ jsx("p", { children: "> VER: 1.0.4b INSTALLED SUCCESSFULLY." }),
      /* @__PURE__ */ jsx("p", { className: "opacity-70", children: "> CHECKING FOR UPDATES..." }),
      /* @__PURE__ */ jsx("p", { className: "opacity-70 text-red-900 font-bold", children: "> WARN: CONNECTION TO CENTRAL SERVER TIMEOUT." }),
      /* @__PURE__ */ jsx("p", { children: "> RUNNING IN OFFLINE MODE." }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 animate-pulse", children: "> _" })
    ] })
  ] })
] });
var TopNavbar = ({ onMenuClick }) => /* @__PURE__ */ jsxs("div", { className: "w-full flex items-center justify-between mb-8 relative z-10", children: [
  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onMenuClick,
        className: "w-10 h-10 border-[1.5px] border-[#4A3B2C] bg-[#F3EAD5] shadow-[2px_2px_0px_rgba(74,59,44,0.15)] flex items-center justify-center hover:bg-[#E3D4BB] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all focus:outline-none",
        children: /* @__PURE__ */ jsx(Menu, { size: 20, className: "text-[#4A3B2C]" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex flex-col", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[12px] font-bold tracking-widest font-serif-cn text-[#4A3B2C]", children: "\u7CFB\u7D71\u5C0E\u822A" }),
      /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono text-[#4A3B2C] opacity-70", children: "SYS.MENU" })
    ] })
  ] }),
  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-[1.5px] border-[#4A3B2C] bg-[#F3EAD5] px-3 h-8 shadow-[2px_2px_0px_rgba(74,59,44,0.15)]", children: [
    /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-[#4A3B2C] animate-pulse" }),
    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono font-bold tracking-[0.1em] text-[#4A3B2C] uppercase", children: "ONLINE" })
  ] })
] });
var BottomToolbar = () => /* @__PURE__ */ jsxs(WireframeBox, { className: "w-full h-10 flex mt-12", innerClassName: "flex items-center px-2 gap-4", children: [
  /* @__PURE__ */ jsxs("div", { className: "flex gap-2 ml-2", children: [
    /* @__PURE__ */ jsx("button", { className: "w-6 h-6 border border-[#4A3B2C] flex items-center justify-center bg-[#F3EAD5] hover:bg-[#E3D4BB] transition-colors", children: /* @__PURE__ */ jsx(Diamond, { size: 10, className: "text-[#4A3B2C]" }) }),
    /* @__PURE__ */ jsx("button", { className: "hidden sm:flex w-6 h-6 border border-[#4A3B2C] items-center justify-center bg-[#F3EAD5] hover:bg-[#E3D4BB] transition-colors", children: /* @__PURE__ */ jsx(Star, { size: 10, className: "text-[#4A3B2C]" }) })
  ] }),
  /* @__PURE__ */ jsx("div", { className: "flex-1 mx-4", children: /* @__PURE__ */ jsx("div", { className: "w-full h-4 border border-[#4A3B2C] bg-[#F3EAD5] flex items-center px-1", children: /* @__PURE__ */ jsx("div", { className: "h-[2px] bg-[#4A3B2C] w-1/2 opacity-50 animate-pulse" }) }) }),
  /* @__PURE__ */ jsx("div", { className: "hidden md:flex w-48 h-6 border border-[#4A3B2C] bg-[#F3EAD5] items-center px-2", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-widest text-[#4A3B2C] font-serif-cn", children: "\u6838\u5FC3\u7CFB\u7D71\u904B\u8F49\u4E2D..." }) }),
  /* @__PURE__ */ jsx("div", { className: "flex gap-2 mr-2", children: /* @__PURE__ */ jsx("button", { className: "w-6 h-6 border border-[#4A3B2C] flex items-center justify-center bg-[#F3EAD5] hover:bg-[#E3D4BB] transition-colors", children: /* @__PURE__ */ jsx(Settings, { size: 12, className: "text-[#4A3B2C]" }) }) })
] });
var App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState("tasks");
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const renderView = () => {
    switch (currentView) {
      case "tasks":
        return /* @__PURE__ */ jsx(TodoApp, {});
      case "archives":
        return /* @__PURE__ */ jsx(ArchivesView, {});
      case "backups":
        return /* @__PURE__ */ jsx(BackupsView, {});
      case "users":
        return /* @__PURE__ */ jsx(UsersView, {});
      case "settings":
        return /* @__PURE__ */ jsx(SettingsView, {});
      case "logs":
        return /* @__PURE__ */ jsx(LogsView, {});
      default:
        return /* @__PURE__ */ jsx(TodoApp, {});
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen text-[#4A3B2C] font-sans selection:bg-[#4A3B2C] selection:text-[#F3EAD5] p-6 md:p-12 flex flex-col justify-between overflow-x-hidden", children: [
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700&display=swap');
        .font-serif-cn { font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif; }
      ` } }),
    /* @__PURE__ */ jsx(ParchmentTexture, {}),
    /* @__PURE__ */ jsx(
      Sidebar,
      {
        isOpen: isSidebarOpen,
        onClose: () => setIsSidebarOpen(false),
        currentView,
        onNavigate: setCurrentView
      }
    ),
    /* @__PURE__ */ jsx(TopNavbar, { onMenuClick: toggleSidebar }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 transition-transform duration-300 relative z-10 w-full", children: renderView() }),
    /* @__PURE__ */ jsx("div", { className: "relative z-10 mt-12", children: /* @__PURE__ */ jsx(BottomToolbar, {}) })
  ] });
};
var vintage_todo_list_app_1_default = App;
export {
  vintage_todo_list_app_1_default as default
};
