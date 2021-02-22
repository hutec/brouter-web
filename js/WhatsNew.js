BR.WhatsNew = {
    init: function () {
        $('#whatsnew').on('hidden.bs.modal', function () {
            localStorage.setItem('changelogVersion', BR.changelog.versions[0].version);
        });
        this.prepare(false);
    },

    hasNewVersions: function () {
        if (!BR.Util.localStorageAvailable()) return false;

        var currentVersion = localStorage.getItem('changelogVersion');

        return !currentVersion || currentVersion < BR.changelog.versions[0].version;
    },

    display: function (newOnly) {
        this.prepare(newOnly);
        $('#whatsnew').modal('show');
    },

    prepare: function (newOnly) {
        var currentVersion = localStorage.getItem('changelogVersion');
        var container = document.querySelector('#whatsnew .modal-body');
        container.innerHTML = null;
        for (let i = 0; i < BR.changelog.versions.length; i++) {
            var changelog = BR.changelog.versions[i];
            if (newOnly && changelog.version < currentVersion) break;

            var versionNode = document.createElement('div');
            var title = document.createElement('h3');
            title.innerText = changelog.title;
            versionNode.appendChild(title);
            for (let c in changelog.parsed) {
                var category = changelog.parsed[c];
                var subtitle = document.createElement('h4');

                if (c === '_') {
                    if (Object.keys(changelog.parsed).length > 1) continue;
                    else subtitle.innerText = 'General';
                } else {
                    subtitle.innerText = c;
                }
                var list = document.createElement('ul');

                for (let j = 0; j < category.length; j++) {
                    var item = document.createElement('li');
                    item.innerText = category[j];
                    list.appendChild(item);
                }
                versionNode.appendChild(subtitle);
                versionNode.appendChild(list);
            }

            /* add a separator between versions to improve readability */
            if (i > 0) container.appendChild(document.createElement('hr'));
            container.appendChild(versionNode);
        }
    },
};
