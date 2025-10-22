getUser();
getPost();

function getCurrentUserId() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("userid");
  return id;
}

function getUser() {
  const id = getCurrentUserId();
  toggleLoader(true);
  axios
    .get(`${baseUrl}/users/${id}`)
    .then((response) => {
      const user = response.data.data;
      document.getElementById("email-profile-user").innerHTML = user.email;
      document.getElementById("name-profile-user").innerHTML = user.name;
      document.getElementById("header-image").src = user.profile_image;
      document.getElementById("username-profile-user").innerHTML =
        user.username;
      document.getElementById("posts-count").innerHTML = user.posts_count;
      document.getElementById("comments-count").innerHTML = user.comments_count;
      document.getElementById("name-posts").innerHTML = username.name;
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

function getPost() {
  const id = getCurrentUserId();
  toggleLoader(true);

  axios
    .get(`${baseUrl}/users/${id}/posts`)
    .then((response) => {
      let posts = response.data.data;
      document.getElementById("user-posts").innerHTML = "";

      posts.forEach((post) => {
        let user = getCurrentUser();
        let isMyPost = user != null && post.author.id == user.id;

        let postsDiv = document.getElementById("user-posts");

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

        cardHeader.appendChild(image);
        cardHeader.appendChild(username);

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
