export function formatTime(timestamp: Date) {
  const time = timestamp.getTime();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  const yesterdayStart = new Date(
    new Date(new Date().setHours(0, 0, 0, 0)).setDate(new Date().getDate() - 1)
  ).getTime();

  const f1 = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
  });
  const f2 = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  if (time > todayStart) {
    return `Today at ${f1.format(timestamp)}`;
  } else if (time > yesterdayStart) {
    return `Yesterday at ${f1.format(timestamp)}`;
  } else {
    return `${f2.format(timestamp)}`;
  }
}

export function formatLastestMessageTime(timestamp: Date) {
  const time = timestamp.getTime();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  // const yesterdayStart = new Date(
  //   new Date(new Date().setHours(0, 0, 0, 0)).setDate(new Date().getDate() - 1)
  // ).getTime();

  const weekStart = new Date(
    new Date(new Date().setHours(0, 0, 0, 0)).setDate(new Date().getDate() - 7)
  ).getTime();

  const f1 = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
  });

  const f2 = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  });
  const f3 = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  if (time > todayStart) {
    return `${f1.format(timestamp)}`;
  } else if (time > weekStart) {
    return `${f2.format(timestamp)}`;
  } else {
    return `${f3.format(timestamp)}`;
  }
}
