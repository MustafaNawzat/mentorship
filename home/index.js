class FireBaseRequest {
    static getMembers(memberRef) {
        return memberRef.get().then(
            docs => docs.docs.map(doc =>
                new Member(doc.data())
            )
        )
    }
}

class MembersView {

    static membersList = document.getElementById("membersList");

    static renderMembers(member) {
        const tagList = member.tags.map(tag => `
        <li class="tag-item"><a href="">${tag}</a></li>
        `).join('')


        MembersView.membersList.insertAdjacentHTML('beforeend', `
            <li id="memberItem" class="list-item">
                <div class="box-content red darken-1 z-depth-3">
                    <div class="row valign-wrapper conatinerMine">
                        <div class="col l10 m9 s12">
                            <h5 id="title">${member.title}</h5>
                            <div>
                                <i class="material-icons iconMine white-text">location_on</i>
                                <p id="location" class="location">${member.city}, ${member.country}</p>
                            </div>
                            <span class="tagWord">Tags</span>
                            <ul id="tagsList" class="tagsList">
                            ${tagList}
                            </ul>                              
                        </div>
                        <div id="info" class="col l2 m3 s12 center-align infoButton">
                            <a class="waves-effect waves-light btn white black-text infoBtn btn-large">info</a>
                        </div>
                    </div>
                </div>
                <!-- /box-content -->
            </li>
        `)
    }

    static render(members) {
        members.forEach(member => {
            MembersView.renderMembers(member);
        });
    }

    static renderInfoModal(members) {
        let modal = document.querySelector('.modal')
        let infoButtons = document.getElementsByClassName('infoButton')

        for (let i = 0; i < infoButtons.length; i++) {
            infoButtons[i].addEventListener('click', function showModal() {
                const tagList = members[i].tags.map(tag => `
                <li class="tag-item"><a href="">${tag}</a></li>
                `).join('')

                modal.innerHTML = `
                         <div class="modal-content">
                              <h4>${members[i].title}</h4>
                              <div>
                              <i class="material-icons iconMine red-text">location_on</i>
                              <p id="location" class="location">${members[i].city}, ${members[i].country}</p>
                              </div>
                              <h5>Description</h5>
                              <p> ${members[i].description}</p>
                              <span class="tagWord">Tags</span>
                              <ul id="tagsList" class="tagsList">
                                 ${tagList}
                              </ul>
                              <p><span class="tagWord">Avaliable Hours: </span>${members[i].startHour} - ${members[i].endHour} </p>
                              <div class="social">
                                 <p class="tagWord">Social Links:</p>
                                </div>
                                <div  class="center-align">
                                   <a id="work-btn" class="waves-effect waves-light btn red white-text infoBtn btn-large center-align">let's work
                                           together (:</a>
                                </div>
                         </div>  `


                let workBtn = document.querySelector('#work-btn')
                workBtn.addEventListener('click', Auth.sendEmail)

                let social = document.querySelector("#memberInfoModal > div > div.social")

                const socialLinkObeject = members[i].socialIconLinks.map(links => links);

                // This part organizes social icons. if member has only github account, the only github icon is rendered on the modal.
                socialLinkObeject.forEach(socialIcon => {

                    if (socialIcon.value != "") {
                        if (socialIcon.type == "github") {
                            social.insertAdjacentHTML('beforeend', `<a href="${socialIcon.value}"><img class="socialIcons"
                                     src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt=""> </a>`);
                        } if (socialIcon.type == "linkedin") {
                            social.insertAdjacentHTML('beforeend', `<a href="${socialIcon.value}"><img class="socialIcons"
                                     src="https://content.linkedin.com/content/dam/me/business/en-us/amp/brand-site/v2/bg/LI-Bug.svg.original.svg" alt=""> </a>`);
                        } if (socialIcon.type == "twitter") {
                            social.insertAdjacentHTML('beforeend', `<a href="${socialIcon.value}"><img class="socialIcons"
                                     src="https://pngimage.net/wp-content/uploads/2018/06/official-twitter-logo-png-3.png" alt=""> </a>`
                            )
                        }
                    }
                })
                memberInfoModalInstance.open()
            })
        }
    }
}


async function run() {

    Auth.checkUser()
    configureNavButtons()

    hasAmember()
    FireBaseRequest.getMembers(memberRef).
        then(members => {
            MembersView.render(members);
            MembersView.renderInfoModal(members)
        })
}

function configureNavButtons() {
    const pageTitle = document.getElementById("pageTitle");
    const type = document.getElementById("type");
    let beMember = document.querySelectorAll('.member-btn')

    const navMemberSelect = document.getElementById("type");
    const beMemberDropdown = document.getElementsByClassName("beMember")[1];

    const urlParams = new URLSearchParams(window.location.search);
    const memberType = urlParams.get('type');
    hasAmember(memberType)

    // If user click mentee gets data from mentees collection, for mentors gets from mentors db collection.
    if (memberType == 'mentees') {
        memberRef = db.collection("mentees");
        pageTitle.innerText = "Mentees"
        beMember[0].innerHTML = 'Be a Mentee'
        navMemberSelect.href = "index.html?type=mentors"
    } else {
        memberRef = db.collection("mentors");
        pageTitle.innerText = "Mentors"
        type.innerText = 'Mentees'
        beMember[0].innerHTML = 'Be a Mentor'
        beMemberDropdown.innerHTML = 'Be a Mentor'
        navMemberSelect.href = "index.html?type=mentees"
    }

    beMember.forEach(btn =>
        btn.addEventListener('click', () => Auth.openFormModal(memberType)))

    let signInBtn = document.getElementById('signInBtn');
    signInBtn.addEventListener("click", () => Auth.sendToForm(memberType));

    let showSignOutBtn = document.querySelectorAll('.signOutBtn')
    showSignOutBtn.forEach(btn =>
        btn.addEventListener('click', Auth.signOut))

}

async function hasAmember(type) {
    let menteeRef = db.collection(type)
    let user = await Auth.getUser()

    menteeRef.where("user_email",  "==", user.email)
    .get()
    .then(querySnapshot =>{
        console.log(querySnapshot);
        
        querySnapshot.forEach(doc => {
           if(doc) {
            const beMember = document.getElementsByClassName("beMember")[0];
            beMember.innerHTML = `my ${type}`
           }
            
        })
    })
}

document.addEventListener("DOMContentLoaded", run);
