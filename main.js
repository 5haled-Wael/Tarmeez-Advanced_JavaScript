window.addEventListener("scroll", () => {
  const endOfPage =
    window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
  if (endOfPage && currentPage < lastPage) {
    currentPage++;
    getPost(currentPage);
  }
});

setupUI();

const baseUrl = "https://tarmeezacademy.com/api/v1";
let currentPage = 1;
let lastPage = 1;

function getPost(page = 1, clear = false) {
  toggleLoader(true);

  axios
    .get(`${baseUrl}/posts?limit=10&page=${page}`)
    .then((response) => {
      let posts = response.data.data;
      lastPage = response.data.meta.last_page;

      if (clear) {
        const postsDiv = document.getElementById("posts");
        postsDiv.innerHTML = "";
      }

      posts.forEach((post) => {
        let user = getCurrentUser();
        let isMyPost = user != null && post.author.id == user.id;

        let postsDiv = document.getElementById("posts");

        let holder = document.createElement("div");
        holder.className = "card";
        holder.classList.add("shadow");

        let cardHeader = document.createElement("div");
        cardHeader.className = "card-header";

        let image = document.createElement("img");
        image.setAttribute("src", post.author.profile_image);
        image.style.width = "40px";
        image.style.height = "40px";
        image.classList.add("rounded-circle");
        image.classList.add("border");
        image.classList.add("border-2");

        let username = document.createElement("b");
        username.innerHTML = post.author.username;

        let editBtn = document.createElement("button");
        editBtn.classList.add("btn", "btn-secondary");
        editBtn.innerHTML = "Edit";
        editBtn.style.float = "right";
        editBtn.addEventListener("click", () => editPostBtnClicked(post));

        let deleteBtn = document.createElement("button");
        deleteBtn.classList.add("btn", "btn-danger");
        deleteBtn.innerHTML = "Delete";
        deleteBtn.style.float = "right";
        deleteBtn.style.marginLeft = "5px";
        deleteBtn.addEventListener("click", () => deletePostBtnClicked(post));

        let imgAndUsername = document.createElement("span");
        imgAndUsername.style.cursor = "pointer";
        imgAndUsername.addEventListener("click", () =>
          userClicked(post.author.id)
        );
        imgAndUsername.appendChild(image);
        imgAndUsername.appendChild(username);

        cardHeader.appendChild(imgAndUsername);

        if (isMyPost) {
          cardHeader.appendChild(deleteBtn);
          cardHeader.appendChild(editBtn);
        }

        let cardBody = document.createElement("div");
        cardBody.className = "card-body";
        cardBody.setAttribute("onclick", `postClicked(${post.id})`);
        cardBody.style.cursor = "pointer";

        let postImg = document.createElement("img");
        postImg.setAttribute("src", post.image);
        postImg.className = "w-100";

        let createTime = document.createElement("h6");
        createTime.style.color = "rgb(193, 193, 193)";
        createTime.className = "mt-1";
        createTime.innerHTML = post.created_at;

        let title = document.createElement("h5");

        post.title != null
          ? (title.innerHTML = post.title)
          : (title.innerHTML = "");

        let content = document.createElement("p");
        content.innerHTML = post.body;

        let hr = document.createElement("hr");

        cardBody.appendChild(postImg);
        cardBody.appendChild(createTime);
        cardBody.appendChild(title);
        cardBody.appendChild(content);
        cardBody.appendChild(hr);

        let footer = document.createElement("div");
        footer.innerHTML = `<div>
        <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-pen"
        viewBox="0 0 16 16">
        <path
          d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
        </svg>
        <span> (${post.comments_count}) Comments
          <span id="post-tags-${post.id}"></span>
        </span>
      </div>`;

        cardBody.appendChild(footer);

        holder.appendChild(cardHeader);
        holder.appendChild(cardBody);

        postsDiv.appendChild(holder);

        const currentPostTagsId = `post-tags-${post.id}`;
        document.getElementById(currentPostTagsId).innerHTML = "";
        for (tag of post.tags) {
          let tagsContent = `
      <button class="btn btn-sm rounded-5" style="background-color: gray; color: white">
          ${tag.name}
        </button>
    `;
          document.getElementById(currentPostTagsId).innerHTML += tagsContent;
        }
      });
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

getPost();

function loginBtnClick() {
  const username = document.getElementById("username-input").value;
  const password = document.getElementById("password-input").value;

  const params = {
    username: username,
    password: password,
  };

  toggleLoader(true);
  axios
    .post(`${baseUrl}/login`, params)
    .then((response) => {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const modal = document.getElementById("login-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      showAlert("Login Successfully", "success");
      setupUI();
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

function registerBtnClick() {
  const name = document.getElementById("register-name-input").value;
  const username = document.getElementById("register-username-input").value;
  const password = document.getElementById("register-password-input").value;
  const image = document.getElementById("register-image-input").files[0];

  let formData = new FormData();
  formData.append("name", name);
  formData.append("username", username);
  formData.append("password", password);
  formData.append("profile_image", image);

  let headers = {
    "Content-Type": "multipart/form-data",
  };

  toggleLoader(true);

  axios
    .post(`${baseUrl}/register`, formData, {
      headers: headers,
    })
    .then((response) => {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const modal = document.getElementById("register-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      showAlert("New User Registered Successfully", "success");
      setupUI();
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  showAlert("Logout successfully", "danger");
  setupUI();
}

function showAlert(message, type) {
  const alertPlaceholder = document.getElementById("alert");
  const appendAlert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);

    setTimeout(() => {
      wrapper.remove();
    }, 2000);
  };
  appendAlert(message, type);
}

function setupUI() {
  const token = localStorage.getItem("token");
  const loginDiv = document.getElementById("login-div");
  const logoutDiv = document.getElementById("logout-div");
  const addBtn = document.getElementById("add-btn");
  // let addCommentDiv = document.getElementById("add-comment-div");

  if (token == null) {
    if (addBtn != null) {
      addBtn.style.setProperty("display", "none", "important");
    }

    loginDiv.style.setProperty("display", "flex", "important");
    logoutDiv.style.setProperty("display", "none", "important");

    // addCommentDiv.style.visibility = "hidden";
  } else {
    if (addBtn != null) {
      addBtn.style.setProperty("display", "block", "important");
    }

    loginDiv.style.setProperty("display", "none", "important");
    logoutDiv.style.setProperty("display", "flex", "important");

    let user = getCurrentUser();
    document.getElementById("nav-username").innerHTML = user.username;
    document.getElementById("nav-user-image").src = user.profile_image;

    // addCommentDiv.style.visibility = "visible";
  }
}

function createNewPost() {
  let postId = document.getElementById("post-id-input").value;
  let isCreate = postId == null || postId == "";

  const title = document.getElementById("post-title-input").value;
  const body = document.getElementById("post-body-input").value;
  const image = document.getElementById("post-image-input").files[0];
  const token = localStorage.getItem("token");

  let formData = new FormData();
  formData.append("title", title);
  formData.append("body", body);
  formData.append("image", image);

  let url = "";
  let headers = {
    "Content-Type": "multipart/form-data",
    authorization: `Bearer ${token}`,
  };

  if (isCreate) {
    url = `${baseUrl}/posts`;
  } else {
    formData.append("_method", "put");
    url = `${baseUrl}/posts/${postId}`;
  }

  toggleLoader(true);
  axios
    .post(url, formData, {
      headers: headers,
    })
    .then((response) => {
      const modal = document.getElementById("create-post-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      showAlert("New Post Has Been Created", "success");
      getPost(1, true);
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

function getCurrentUser() {
  let user = null;
  const storageUser = localStorage.getItem("user");

  if (storageUser != null) {
    user = JSON.parse(storageUser);
  }

  return user;
}

function postClicked(postId) {
  window.location = `postDetails.html?postId=${postId}`;
}

function editPostBtnClicked(post) {
  document.getElementById("post-id-input").value = post.id;

  document.getElementById("post-modal-submit-btn").innerHTML = "Update";
  document.getElementById("post-modal-title").innerHTML = "Edit Post";
  document.getElementById("post-title-input").value = post.title;
  document.getElementById("post-body-input").value = post.body;

  let postModal = new bootstrap.Modal(
    document.getElementById("create-post-modal"),
    {}
  );
  postModal.toggle();
}

function deletePostBtnClicked(post) {
  document.getElementById("delete-post-id-input").value = post.id;

  let postModal = new bootstrap.Modal(
    document.getElementById("delete-post-modal"),
    {}
  );
  postModal.toggle();
}

function confirmPostDelete() {
  const token = localStorage.getItem("token");
  const postId = document.getElementById("delete-post-id-input").value;
  let url = `${baseUrl}/posts/${postId}`;
  let headers = {
    authorization: `Bearer ${token}`,
  };

  toggleLoader(true);

  axios
    .delete(url, {
      headers: headers,
    })
    .then((response) => {
      const modal = document.getElementById("delete-post-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      showAlert("The Post Has Been Deleted Successfully", "success");
      getPost(1, true);
    })
    .catch((error) => {
      const message = error.response.data.message;
      showAlert(message, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

function addBtnClicked() {
  document.getElementById("post-id-input").value = "";

  document.getElementById("post-modal-submit-btn").innerHTML = "Create";
  document.getElementById("post-modal-title").innerHTML = "Create A New Post";
  document.getElementById("post-title-input").value = "";
  document.getElementById("post-body-input").value = "";

  let postModal = new bootstrap.Modal(
    document.getElementById("create-post-modal"),
    {}
  );
  postModal.toggle();
}

function userClicked(userId) {
  window.location = `profile.html?userid=${userId}`;
}

function profileClicked() {
  const user = getCurrentUser();
  window.location = `profile.html?userid=${user.id}`;
}

function toggleLoader(show = true) {
  if (show) {
    document.getElementById("loader").style.visibility = "visible";
  } else {
    document.getElementById("loader").style.visibility = "hidden";
  }
}
