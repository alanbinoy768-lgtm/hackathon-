
const STORAGE_KEY = "peerpulse-profiles";
const ACTIVE_PROFILE_KEY = "peerpulse-active-profile";
const REQUESTS_KEY = "peerpulse-requests";
const RESCUE_KEY = "peerpulse-rescue-modules";
const LIBRARY_KEY = "peerpulse-library";

const askButton = document.getElementById("askButton");
const browseLibraryButton = document.getElementById("browseLibraryButton");
const helpForm = document.getElementById("helpForm");
const doubtForm = document.getElementById("doubtForm");
const cancelButton = document.getElementById("cancelButton");
const requestList = document.getElementById("requestList");
const requestCount = document.getElementById("requestCount");
const requestsPageList = document.getElementById("requestsPageList");
const leaderboardList = document.getElementById("leaderboardList");
const leaderboardPageList = document.getElementById("leaderboardPageList");
const libraryList = document.getElementById("libraryList");
const rescueList = document.getElementById("rescueList");
const chatForm = document.getElementById("chatForm");
const chatMessages = document.getElementById("chatMessages");
const chatResolveButton = document.getElementById("chatResolveButton");
const navButtons = document.querySelectorAll(".nav-pill");
const views = document.querySelectorAll(".view-panel");
const profileForm = document.getElementById("profileForm");
const editProfileButton = document.getElementById("editProfileButton");
const addProfileButton = document.getElementById("addProfileButton");
const addModuleButton = document.getElementById("addModuleButton");
const viewLibraryButton = document.getElementById("viewLibraryButton");
const activeProfileSelect = document.getElementById("activeProfileSelect");
const attachmentInput = document.getElementById("attachmentInput");
const attachmentSummary = document.getElementById("attachmentSummary");
const chatImageInput = document.getElementById("chatImageInput");
const chatImageButton = document.getElementById("chatImageButton");
const filterButtons = document.querySelectorAll(".filter-btn");

const state = {
  profiles: getStoredProfiles(),
  activeProfileId: getActiveProfileId(),
  requests: getStoredRequests(),
  leaderboard: [],
  library: getStoredLibrary(),
  leaderboardFilter: "topHelpers",
  attachedFiles: [],
  rescueModules: getStoredRescueModules()
};

function getStoredProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Unable to read stored profiles.", error);
    return [];
  }
}

function getStoredRequests() {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Unable to read stored requests.", error);
    return [];
  }
}

function getStoredLibrary() {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Unable to read stored library.", error);
    return [];
  }
}

function getStoredRescueModules() {
  try {
    const raw = localStorage.getItem(RESCUE_KEY);
    if (!raw) {
      return [
        { title: "Review missed lecture notes", done: false },
        { title: "Mark required topics for catch-up", done: false },
        { title: "Create a study checklist for next exam", done: false }
      ];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) {
      return [
        { title: "Review missed lecture notes", done: false },
        { title: "Mark required topics for catch-up", done: false },
        { title: "Create a study checklist for next exam", done: false }
      ];
    }

    return parsed
      .map((module) => ({
        title: String(module.title || "").trim(),
        done: Boolean(module.done)
      }))
      .filter((module) => module.title);
  } catch (error) {
    console.warn("Unable to read stored rescue modules.", error);
    return [
      { title: "Review missed lecture notes", done: false },
      { title: "Mark required topics for catch-up", done: false },
      { title: "Create a study checklist for next exam", done: false }
    ];
  }
}

function persistProfiles() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.profiles));
}

function persistRequests() {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(state.requests));
}

function persistLibrary() {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(state.library));
}

function persistRescueModules() {
  localStorage.setItem(RESCUE_KEY, JSON.stringify(state.rescueModules));
}

function getActiveProfileId() {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY) || "";
  } catch (error) {
    console.warn("Unable to read active profile.", error);
    return "";
  }
}

function persistActiveProfile(id) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
}

function getStoredProfile() {
  return state.profiles.find((profile) => profile.id === state.activeProfileId) || null;
}

function getActiveProfile() {
  return state.profiles.find((profile) => profile.id === state.activeProfileId) || null;
}

function persistProfile(profile) {
  const existingIndex = state.profiles.findIndex((item) => item.id === profile.id);
  if (existingIndex >= 0) {
    state.profiles[existingIndex] = profile;
  } else {
    state.profiles.push(profile);
  }
  persistProfiles();
}

function buildInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "ST";
}

function buildInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "ST";
}

function updateHomeMetrics() {
  const requestsMetric = document.getElementById("homeRequestsMetric");
  const helpMetric = document.getElementById("homeHelpMetric");
  const networkMetric = document.getElementById("homeNetworkMetric");
  const activeProfile = getActiveProfile();
  const openRequests = state.requests.filter((request) => !["Solved", "Declined"].includes(request.status)).length;

  if (requestsMetric) requestsMetric.textContent = String(openRequests);
  if (helpMetric) helpMetric.textContent = String(activeProfile ? (activeProfile.helped || 0) : 0);
  if (networkMetric) {
    const networkSize = Math.max(1, state.profiles.length || 1);
    networkMetric.textContent = String(networkSize);
  }
}

function renderProfile() {
  const profile = getActiveProfile();
  const avatar = document.getElementById("profileAvatar");
  const nameNode = document.getElementById("profileName");
  const summaryNode = document.getElementById("profileSummary");
  const subjectsNode = document.getElementById("profileSubjects");
  const impactNode = document.getElementById("profileImpact");
  const pointsNode = document.getElementById("profilePoints");
  const helpedNode = document.getElementById("profileHelped");
  const badgesNode = document.getElementById("profileBadges");

  if (!profile) {
    if (avatar) avatar.textContent = "NA";
    if (nameNode) nameNode.textContent = "Your name";
    if (summaryNode) summaryNode.textContent = "Course · Semester · College";
    if (subjectsNode) subjectsNode.innerHTML = "";
    if (impactNode) impactNode.innerHTML = "";
    if (pointsNode) pointsNode.textContent = "0";
    if (helpedNode) helpedNode.textContent = "0";
    if (badgesNode) badgesNode.textContent = "0";
    return;
  }

  if (avatar) avatar.textContent = buildInitials(profile.name);
  if (nameNode) nameNode.textContent = profile.name;
  if (summaryNode) {
    summaryNode.textContent = `${profile.course} · Semester ${profile.semester} · ${profile.college}`;
  }
  if (subjectsNode) {
    subjectsNode.innerHTML = "";
    const tagList = profile.subjects.split(",").map((subject) => subject.trim()).filter(Boolean);
    tagList.forEach((subject) => {
      const span = document.createElement("span");
      span.textContent = subject;
      subjectsNode.appendChild(span);
    });
  }
  if (impactNode) {
    impactNode.innerHTML = "";
    const activity = [
      "Set up your learning profile",
      "Ask your first question for help",
      "Share notes or explanations with peers"
    ];
    activity.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      impactNode.appendChild(li);
    });
  }
  if (pointsNode) pointsNode.textContent = String(profile.points || 0);
  if (helpedNode) helpedNode.textContent = String(profile.helped || 0);
  if (badgesNode) badgesNode.textContent = String(profile.badges || 0);

  updateHomeMetrics();
}

function setActiveView(viewName) {
  const target = `${viewName}Screen`;

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });

  views.forEach((view) => {
    const shouldShow = view.id === target;
    view.classList.toggle("active", shouldShow);
    view.hidden = !shouldShow;
  });
}

function renderEmptyState(container, title, message) {
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state">
      <h3>${title}</h3>
      <p>${message}</p>
    </div>
  `;
}

function updateRequestCount() {
  if (requestCount) {
    const active = state.requests.filter((item) => !["Solved", "Declined"].includes(item.status)).length;
    requestCount.textContent = `${active} active`;
  }
}

function getCurrentAcceptedRequestForProfile() {
  const activeProfile = getActiveProfile();
  if (!activeProfile) return null;

  return [...state.requests]
    .filter((request) => request.fromProfileId === activeProfile.id && request.status === "Accepted")
    .sort((a, b) => (b.id || 0) - (a.id || 0))[0] || null;
}

function markRequestAsSolved(requestId) {
  const request = state.requests.find((item) => item.id === requestId);
  if (!request) return;

  const activeProfile = getActiveProfile();
  if (activeProfile && request.fromProfileId !== activeProfile.id) {
    alert("Only the student who sent the doubt can mark it as solved.");
    return;
  }

  request.status = "Solved";
  request.solvedAt = new Date().toISOString();

  const helperProfile = state.profiles.find((profile) => profile.id === request.helperProfileId);
  if (helperProfile) {
    helperProfile.points = (helperProfile.points || 0) + 10;
    helperProfile.helped = (helperProfile.helped || 0) + 1;
  }

  persistRequests();
  persistProfiles();
  renderProfile();
  renderRequests();
  renderLeaderboard();
  updateHomeMetrics();
  addSystemMessage(`${request.fromProfileName || "A student"} marked the doubt as solved.`);
}

function createRequestCard(request, includeActions = true) {
  const card = document.createElement("article");
  card.className = "request-card";

  const head = document.createElement("div");
  head.className = "request-card-head";

  const title = document.createElement("h3");
  title.textContent = request.topic;

  const status = document.createElement("span");
  status.className = `status-badge ${request.status.toLowerCase()}`;
  status.textContent = request.status;

  head.append(title, status);

  const meta = document.createElement("p");
  meta.className = "request-meta";
  meta.textContent = `${request.subject} · ${request.recipient} · ${request.urgency}`;

  const body = document.createElement("p");
  body.textContent = request.description;

  card.append(head, meta, body);

  if (includeActions && request.status === "Pending") {
    const actions = document.createElement("div");
    actions.className = "request-card-actions";

    const acceptButton = document.createElement("button");
    acceptButton.type = "button";
    acceptButton.className = "primary-btn small";
    acceptButton.textContent = "Accept";
    acceptButton.addEventListener("click", () => {
      const activeProfile = getActiveProfile();
      if (!activeProfile) {
        alert("Please select a valid community profile before accepting a request.");
        return;
      }

      request.status = "Accepted";
      request.helper = `${activeProfile.name} accepted`;
      request.helperProfileId = activeProfile.id;
      request.helperProfileName = activeProfile.name;

      const helperProfile = state.profiles.find((profile) => profile.id === activeProfile.id);
      if (helperProfile) {
        helperProfile.points = (helperProfile.points || 0) + 20;
        helperProfile.helped = (helperProfile.helped || 0) + 1;
        helperProfile.explained = (helperProfile.explained || 0) + 1;
        helperProfile.badges = (helperProfile.badges || 0) + 1;
      }

      const requesterProfile = state.profiles.find((profile) => profile.id === request.fromProfileId);
      if (requesterProfile) {
        requesterProfile.points = (requesterProfile.points || 0) + 10;
      }

      addLibraryEntryFromRequest(request);
      persistProfiles();
      persistRequests();
      renderProfile();
      renderRequests();
      renderLibrary();
      renderLeaderboard();
      addSystemMessage(`${activeProfile.name} accepted the request from ${request.fromProfileName}.`);
    });

    const declineButton = document.createElement("button");
    declineButton.type = "button";
    declineButton.className = "secondary-btn light";
    declineButton.textContent = "Decline";
    declineButton.addEventListener("click", () => {
      const promptReason = typeof window.prompt === "function" ? window.prompt("Tell the student why you are declining:") : null;
      if (promptReason === null) {
        alert("Please use a browser that supports prompt dialogs to decline a request.");
        return;
      }

      const reason = promptReason.trim();
      if (!reason) return;

      request.status = "Declined";
      request.declineReason = reason;
      renderRequests();
    });

    actions.append(acceptButton, declineButton);
    card.appendChild(actions);
  }

  if (request.status === "Declined" && request.declineReason) {
    const declineNote = document.createElement("p");
    declineNote.style.marginTop = "14px";
    declineNote.style.color = "var(--danger)";
    declineNote.textContent = `Decline reason: ${request.declineReason}`;
    card.appendChild(declineNote);
  }

  if (request.status === "Accepted") {
    const actions = document.createElement("div");
    actions.className = "request-card-actions";

    const activeProfile = getActiveProfile();
    const isRequester = activeProfile && request.fromProfileId === activeProfile.id;

    if (isRequester) {
      const solvedButton = document.createElement("button");
      solvedButton.type = "button";
      solvedButton.className = "primary-btn small";
      solvedButton.textContent = "Doubt solved";
      solvedButton.addEventListener("click", () => markRequestAsSolved(request.id));
      actions.appendChild(solvedButton);
    }

    const chatLink = document.createElement("button");
    chatLink.type = "button";
    chatLink.className = "secondary-btn";
    chatLink.textContent = "Open private chat";
    chatLink.addEventListener("click", () => {
      setActiveView("home");
      document.querySelector(".chat-panel").scrollIntoView({ behavior: "smooth", block: "center" });
    });

    actions.appendChild(chatLink);
    card.appendChild(actions);
  }

  if (request.status === "Solved") {
    const solvedNote = document.createElement("p");
    solvedNote.style.marginTop = "12px";
    solvedNote.style.color = "var(--success)";
    solvedNote.style.fontWeight = "700";
    solvedNote.textContent = "Doubt marked as solved.";
    card.appendChild(solvedNote);
  }

  return card;
}

function renderRequests() {
  if (requestList) {
    requestList.innerHTML = "";
    const visible = state.requests.filter((request) => request.status !== "Solved");
    if (!visible.length) {
      renderEmptyState(requestList, "No help requests yet", "Your first request will appear here as soon as you ask for support.");
    } else {
      visible.forEach((request) => requestList.appendChild(createRequestCard(request)));
    }
  }

  if (requestsPageList) {
    requestsPageList.innerHTML = "";
    if (!state.requests.length) {
      renderEmptyState(requestsPageList, "No requests", "This page will populate with active student questions and support requests.");
    } else {
      state.requests.forEach((request) => requestsPageList.appendChild(createRequestCard(request, false)));
    }
  }

  if (chatResolveButton) {
    const request = getCurrentAcceptedRequestForProfile();
    chatResolveButton.hidden = !request;
  }

  updateRequestCount();
  updateHomeMetrics();
}

function getLeaderboardEntries() {
  const communityProfiles = state.profiles.length
    ? state.profiles.map((profile) => ({
        name: profile.name,
        subject: profile.subjects.split(",")[0]?.trim() || "Community",
        points: profile.points || 0,
        badge: profile.badges > 0 ? "Community star" : "Rising helper",
        explained: profile.explained || 0,
        helped: profile.helped || 0
      }))
    : [];

  if (!communityProfiles.length) {
    return [];
  }

  if (state.leaderboardFilter === "bestExplained") {
    return [...communityProfiles].sort((a, b) => b.explained - a.explained || b.points - a.points);
  }

  if (state.leaderboardFilter === "mostHelped") {
    return [...communityProfiles].sort((a, b) => b.helped - a.helped || b.points - a.points);
  }

  return [...communityProfiles].sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
}

function renderLeaderboard() {
  const renderRows = (container) => {
    if (!container) return;
    container.innerHTML = "";

    const entries = getLeaderboardEntries();

    if (!entries.length) {
      renderEmptyState(container, "No leaderboard activity yet", "Once students resolve doubts and share useful help, rankings will appear here.");
      return;
    }

    entries.forEach((person, index) => {
      const row = document.createElement("div");
      row.className = "leaderboard-item";

      const rank = document.createElement("div");
      rank.className = "rank-badge";
      rank.textContent = index + 1;

      const profile = document.createElement("div");
      profile.className = "person";
      const name = document.createElement("strong");
      name.textContent = person.name;
      const subject = document.createElement("small");
      subject.textContent = person.subject;
      profile.append(name, subject);

      const score = document.createElement("div");
      score.className = "score";
      score.textContent = `${person.points} pts`;

      const badge = document.createElement("span");
      badge.className = "badge-cta";
      badge.textContent = person.badge;

      row.append(rank, profile, score, badge);
      container.appendChild(row);
    });
  };

  renderRows(leaderboardList);
  renderRows(leaderboardPageList);
}

function addLibraryEntryFromRequest(request) {
  if (!request || !request.topic) return;

  const existing = state.library.some((item) => item.title === request.topic && item.description === request.description);
  if (existing) return;

  state.library.unshift({
    title: request.topic,
    description: request.description,
    helperName: request.helperProfileName || request.helper || "Community mentor",
    tags: [request.subject, request.urgency || "Community"]
  });

  persistLibrary();
}

function renderLibrary() {
  if (!libraryList) return;
  libraryList.innerHTML = "";

  if (!state.library.length) {
    renderEmptyState(libraryList, "No shared explanations yet", "Reviewed doubts and teaching notes from the community will appear here.");
    return;
  }

  state.library.forEach((item) => {
    const article = document.createElement("article");
    article.className = "library-item";

    const title = document.createElement("h4");
    title.textContent = item.title;

    const summary = document.createElement("p");
    summary.textContent = item.description;

    const helper = document.createElement("p");
    helper.className = "library-helper";
    helper.textContent = `Solved by ${item.helperName || "Community mentor"}`;

    const tags = document.createElement("div");
    tags.className = "library-tags";

    item.tags.forEach((tag) => {
      const pill = document.createElement("span");
      pill.textContent = tag;
      tags.appendChild(pill);
    });

    article.append(title, summary, helper, tags);
    libraryList.appendChild(article);
  });
}

function renderRescue() {
  if (!rescueList) return;
  rescueList.innerHTML = "";

  state.rescueModules.forEach((module) => {
    const item = document.createElement("li");
    if (module.done) item.classList.add("done");

    const left = document.createElement("div");
    left.className = "checklist-left";

    const check = document.createElement("span");
    check.className = "check";

    const label = document.createElement("span");
    label.textContent = module.title;

    left.append(check, label);

    const status = document.createElement("span");
    status.textContent = module.done ? "Done" : "Pending";

    item.append(left, status);
    item.addEventListener("click", () => {
      module.done = !module.done;
      persistRescueModules();
      renderRescue();
    });
    rescueList.appendChild(item);
  });
}

function openModuleDialog() {
  let modal = document.getElementById("moduleDialog");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "moduleDialog";
    modal.className = "module-modal";
    modal.innerHTML = `
      <div class="module-backdrop" data-close="true"></div>
      <div class="module-card" role="dialog" aria-modal="true" aria-labelledby="moduleDialogTitle">
        <div class="module-header">
          <h3 id="moduleDialogTitle">Add recovery module</h3>
          <button type="button" class="module-close" aria-label="Close dialog">×</button>
        </div>
        <form id="moduleForm" class="module-form">
          <label>
            <span>Module name</span>
            <input id="moduleInput" type="text" placeholder="e.g. Practice linked list traversal" maxlength="80" required />
          </label>
          <div class="module-actions">
            <button type="button" class="secondary-btn light module-cancel">Cancel</button>
            <button type="submit" class="primary-btn small">Add module</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const closeButton = modal.querySelector(".module-close");
    const cancelButton = modal.querySelector(".module-cancel");
    const backdrop = modal.querySelector(".module-backdrop");
    const form = modal.querySelector("#moduleForm");
    const input = modal.querySelector("#moduleInput");

    closeButton.addEventListener("click", () => modal.classList.remove("visible"));
    cancelButton.addEventListener("click", () => modal.classList.remove("visible"));
    backdrop.addEventListener("click", () => modal.classList.remove("visible"));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) {
        input.focus();
        return;
      }

      const duplicate = state.rescueModules.some((module) => module.title.toLowerCase() === value.toLowerCase());
      if (duplicate) {
        alert("That module is already on your recovery checklist.");
        input.focus();
        return;
      }

      state.rescueModules.push({ title: value, done: false });
      persistRescueModules();
      renderRescue();
      modal.classList.remove("visible");
      form.reset();
    });
  }

  const input = modal.querySelector("#moduleInput");
  modal.classList.add("visible");
  input.value = "";
  setTimeout(() => input.focus(), 50);
}

function addSystemMessage(message) {
  if (!chatMessages) return;

  const row = document.createElement("div");
  row.className = "message-row them";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const sender = document.createElement("strong");
  sender.textContent = "Community";

  const text = document.createElement("p");
  text.textContent = message;

  bubble.append(sender, text);
  row.appendChild(bubble);
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showProfileForm() {
  const form = document.getElementById("profileForm");
  if (!form) return;

  const profile = getActiveProfile();
  if (profile) {
    document.getElementById("profileNameInput").value = profile.name;
    document.getElementById("profileCourseInput").value = profile.course;
    document.getElementById("profileSemesterInput").value = profile.semester;
    document.getElementById("profileCollegeInput").value = profile.college;
    document.getElementById("profileSubjectsInput").value = profile.subjects;
  }

  setActiveView("onboarding");
}

function syncProfileSelector() {
  if (!activeProfileSelect) return;

  activeProfileSelect.innerHTML = "";
  state.profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.name;
    option.selected = profile.id === state.activeProfileId;
    activeProfileSelect.appendChild(option);
  });

  if (!state.profiles.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No profile selected";
    option.selected = true;
    activeProfileSelect.appendChild(option);
  }
}

function switchActiveProfile(profileId) {
  if (!profileId) {
    state.activeProfileId = "";
    persistActiveProfile("");
    renderProfile();
    syncProfileSelector();
    setActiveView("onboarding");
    return;
  }

  state.activeProfileId = profileId;
  persistActiveProfile(profileId);
  syncProfileSelector();
  renderProfile();
  setActiveView("home");
}

function attachHandlers() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!getActiveProfile() && button.dataset.view !== "home") {
        setActiveView("onboarding");
        return;
      }
      setActiveView(button.dataset.view);
    });
  });

  if (activeProfileSelect) {
    activeProfileSelect.addEventListener("change", (event) => {
      switchActiveProfile(event.target.value);
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
      state.leaderboardFilter = button.dataset.filter || "topHelpers";
      renderLeaderboard();
    });
  });

  if (editProfileButton) {
    editProfileButton.addEventListener("click", showProfileForm);
  }

  if (addProfileButton) {
    addProfileButton.addEventListener("click", () => {
      state.activeProfileId = "";
      persistActiveProfile("");
      renderProfile();
      syncProfileSelector();
      setActiveView("onboarding");
    });
  }

  if (addModuleButton) {
    addModuleButton.addEventListener("click", () => {
      openModuleDialog();
    });
  }

  if (viewLibraryButton) {
    viewLibraryButton.addEventListener("click", () => {
      const librarySection = document.getElementById("libraryList");
      if (librarySection) {
        librarySection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  document.querySelectorAll(".chip-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.attachmentType || "file";
      const files = type === "photo" ? ["photo-upload.jpg"] : type === "voice" ? ["voice-note.m4a"] : ["notes.pdf"];
      state.attachedFiles = files;
      if (attachmentSummary) {
        attachmentSummary.textContent = `${files.length} attachment selected: ${files.join(", ")}`;
      }
      if (attachmentInput) {
        attachmentInput.click();
      }
    });
  });

  if (attachmentInput) {
    attachmentInput.addEventListener("change", (event) => {
      const files = Array.from(event.target.files || []);
      state.attachedFiles = files.length ? files.map((file) => file.name) : [];
      if (attachmentSummary) {
        attachmentSummary.textContent = files.length
          ? `${files.length} attachment${files.length > 1 ? "s" : ""} selected: ${files.map((file) => file.name).join(", ")}`
          : "No attachments added yet.";
      }
    });
  }

  const newRequestFromRequests = document.getElementById("newRequestFromRequests");
  if (newRequestFromRequests) {
    newRequestFromRequests.addEventListener("click", () => {
      setActiveView("home");
      if (helpForm) {
        helpForm.hidden = false;
        helpForm.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  if (askButton) {
    askButton.addEventListener("click", () => {
      if (helpForm) {
        helpForm.hidden = false;
        helpForm.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  if (browseLibraryButton) {
    browseLibraryButton.addEventListener("click", () => {
      setActiveView("home");
      const librarySection = document.getElementById("libraryList");
      if (librarySection) {
        librarySection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      helpForm.hidden = true;
      doubtForm.reset();
    });
  }

  if (profileForm) {
    profileForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("profileNameInput").value.trim();
      const course = document.getElementById("profileCourseInput").value.trim();
      const semester = document.getElementById("profileSemesterInput").value;
      const college = document.getElementById("profileCollegeInput").value.trim();
      const subjects = document.getElementById("profileSubjectsInput").value.trim();

      if (!name || !course || !semester || !college || !subjects) {
        alert("Please complete all profile fields.");
        return;
      }

      const existingProfile = getActiveProfile();
      const newProfile = {
        id: crypto.randomUUID ? crypto.randomUUID() : `profile-${Date.now()}`,
        name,
        course,
        semester,
        college,
        subjects,
        points: 0,
        helped: 0,
        explained: 0,
        badges: 0
      };

      const profileData = existingProfile && existingProfile.name === name && existingProfile.course === course
        ? existingProfile
        : newProfile;

      if (!state.profiles.some((profile) => profile.id === profileData.id)) {
        state.profiles.push(profileData);
      } else if (existingProfile && existingProfile.name === name && existingProfile.course === course) {
        const index = state.profiles.findIndex((profile) => profile.id === existingProfile.id);
        state.profiles[index] = { ...state.profiles[index], name, course, semester, college, subjects };
      }

      state.activeProfileId = profileData.id;
      persistActiveProfile(profileData.id);
      persistProfiles();
      renderProfile();
      renderLeaderboard();
      syncProfileSelector();
      updateHomeMetrics();
      setActiveView("home");
      profileForm.reset();
      alert("Profile created successfully.");
    });
  }

  if (doubtForm) {
    doubtForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const topic = document.getElementById("topic").value.trim();
      const subject = document.getElementById("subject").value;
      const description = document.getElementById("description").value.trim();
      const recipient = document.getElementById("recipient").value;
      const urgency = document.getElementById("urgency").value;

      if (!topic || !subject || !description || !recipient) {
        alert("Please complete the required fields before sending your request.");
        return;
      }

      const activeProfile = getActiveProfile();
      if (!activeProfile) {
        alert("Please create or switch to a profile before sending a request.");
        return;
      }

      const request = {
        id: Date.now(),
        fromProfileId: activeProfile.id,
        fromProfileName: activeProfile.name,
        topic,
        subject,
        description,
        recipient,
        urgency,
        attachments: [...state.attachedFiles],
        status: "Pending",
        helper: "Waiting for response"
      };

      state.requests.unshift(request);
      persistRequests();
      state.attachedFiles = [];
      if (attachmentInput) attachmentInput.value = "";
      if (attachmentSummary) attachmentSummary.textContent = "No attachments added yet.";
      renderRequests();
      helpForm.hidden = true;
      doubtForm.reset();
      setActiveView("requests");
      addSystemMessage(`Your question is now live in the community. ${activeProfile.name} is seeking help.`);
    });
  }

  if (chatImageButton && chatImageInput) {
    chatImageButton.addEventListener("click", () => {
      chatImageInput.click();
    });

    chatImageInput.addEventListener("change", () => {
      if (chatImageInput.files && chatImageInput.files.length) {
        chatImageButton.textContent = `${chatImageInput.files.length} photo selected`;
      }
    });
  }

  if (chatResolveButton) {
    chatResolveButton.addEventListener("click", () => {
      const request = getCurrentAcceptedRequestForProfile();
      if (!request) {
        alert("You can only end an accepted help session that you started.");
        return;
      }

      markRequestAsSolved(request.id);
    });
  }

  if (chatForm) {
    chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = document.getElementById("chatInput");
      const value = input.value.trim();
      const selectedFile = chatImageInput && chatImageInput.files && chatImageInput.files[0] ? chatImageInput.files[0] : null;

      if (!value && !selectedFile) return;

      const row = document.createElement("div");
      row.className = "message-row me";

      const bubble = document.createElement("div");
      bubble.className = "bubble";

      const sender = document.createElement("strong");
      sender.textContent = "You";
      bubble.appendChild(sender);

      if (selectedFile && selectedFile.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(selectedFile);
        img.alt = "Solved problem photo";
        img.style.maxWidth = "100%";
        img.style.borderRadius = "12px";
        img.style.marginBottom = "8px";
        img.style.display = "block";
        bubble.appendChild(img);
      }

      if (value) {
        const text = document.createElement("p");
        text.textContent = value;
        bubble.appendChild(text);
      }

      row.appendChild(bubble);
      chatMessages.appendChild(row);
      input.value = "";
      if (chatImageInput) {
        chatImageInput.value = "";
        chatImageButton.textContent = "Photo";
      }
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }
}

syncProfileSelector();
renderProfile();
renderRequests();
renderLeaderboard();
renderLibrary();
renderRescue();
updateHomeMetrics();
attachHandlers();

if (state.profiles.length && state.activeProfileId) {
  setActiveView("home");
} else {
  setActiveView("onboarding");
}
