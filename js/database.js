document.addEventListener('DOMContentLoaded', () => {
    const jsonContent = document.getElementById('json-content');
    const totalCountTopElement = document.getElementById('total-count-top'); // 件数表示用の要素（上部）を取得
    const totalCountBottomElement = document.getElementById('total-count-bottom'); // 件数表示用の要素（下部）を取得
    const controls = document.getElementById('controls');
    const orderSelect = document.getElementById('order-select');
    const currentSortElement = document.getElementById('current-sort');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resetButton = document.getElementById('reset-button');
    const paginationElement = document.getElementById('pagination');
    const pageInfoTopElement = document.getElementById('page-info-top'); // ページ情報表示用の要素（上部）を取得
    const pageInfoBottomElement = document.getElementById('page-info-bottom'); // ページ情報表示用の要素（下部）を取得
    const pageSelectElement = document.getElementById('page-select'); // ページジャンプ用のプルダウンメニューを取得

    const ITEMS_PER_PAGE = 100;
    let currentPage = 1;

    // 読み込むJSONファイルのリスト
    const jsonFiles = [
        'processed-all-shorts.json',
        'processed-all-streams.json',
        'processed-all-videos.json',
        'processed-from-membership.json',
        'processed-external.json'
    ];
    // 非公開リスト
    const deleteID = [
        'GVQJkA7F860',
        'WH16JdWAqhA',
        'cSsrzCuhH88',
        'ouFw4NKD7Vk',
        'QXoE2SO9mOA',
        'Q2DWc8Cs348',
        't7Pg1nZSzNU',
        'XAu6XTBkZUg',
        'hrC_jyIzetA',
        'IB5LNsBWSoo',
        'QOeGoB6gy5Q',
        'r8iAnzzO_dE',
        'O2VwpgzI0oQ',
        'IbhSSN53F5E',
        'XmsuhI2Wzn0',
        '-iXs5mdJrEM',
        'YWFGqcRfS_M',
        'W-fmVIcwW-o',
        'Fj4HIrXXwQo',
        'TCNs5e6bk5Y',
        'JkpIFMVnPoM',
        '4HQFXrIJj68',
        '5gb7kIqCxZ0',
        'PmPTo_4-gOE',
        'kyke6O8g-Ck'
    ];

    // fetchリクエストを作成
    const fetchPromises = jsonFiles.map(file => fetch(`json/${file}`).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json().then(data => ({ file, data }));
    }));

    let fileDataMap = {};
    let currentSortCriteria = 'startAt';
    let isAscending = true; // 昇順か降順かを示すフラグ
    let searchWords = [];
    let searchType = 'and';

    // 全てのfetchリクエストが完了するのを待つ
    Promise.all(fetchPromises)
        .then(results => {
            //console.log(results); // コンソールに表示

            // JSONデータをマップに格納
            results.forEach(({ file, data }) => {
                fileDataMap[file] = data;
            });

            // 初期表示は日付順
            sortAndDisplay(currentSortCriteria);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });

    // ソートと表示を行う関数
    function sortAndDisplay(criteria, resetPage = true) {
        if (resetPage) currentPage = 1;

        const selectedFiles = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.getAttribute('data-file'));
        let combinedData = selectedFiles.flatMap(file => fileDataMap[file] || []);

        // 検索フィルタを適用
        if (searchWords.length > 0) {
            combinedData = combinedData.filter(item => {
                const title = item.title || '';
                const lowerCaseTitle = title.toLowerCase();
                if (searchType === 'and') {
                    return searchWords.every(word => lowerCaseTitle.includes(word.toLowerCase()));
                } else {
                    return searchWords.some(word => lowerCaseTitle.includes(word.toLowerCase()));
                }
            });
        }

        combinedData.sort((a, b) => {
            let valueA, valueB;

            switch (criteria) {
                case 'startAt':
                    valueA = new Date(a.time?.startAt);
                    valueB = new Date(b.time?.startAt);
                    break;
                case 'viewCount':
                    valueA = a.statistics?.viewCount || 0;
                    valueB = b.statistics?.viewCount || 0;
                    break;
                case 'duration':
                    valueA = a.time?.duration || 0;
                    valueB = b.time?.duration || 0;
                    break;
                case 'likeCount':
                    valueA = a.statistics?.likeCount || 0;
                    valueB = b.statistics?.likeCount || 0;
                    break;
                case 'commentCount':
                    valueA = a.statistics?.commentCount || 0;
                    valueB = b.statistics?.commentCount || 0;
                    break;
                default:
                    return 0;
            }

            return isAscending ? valueA - valueB : valueB - valueA;
        });

        displayData(combinedData);
        updateCurrentSortDisplay();
    }

    // JSONデータをHTMLに表示するための関数
    function displayData(dataArray) {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedData = dataArray.slice(startIndex, endIndex);

        let htmlContent = '<ul class="list">';
        paginatedData.forEach((item, index) => {
            // 各プロパティの存在を確認
            const title = item.title || 'タイトル不明';
            const id = item.id;
            const description = (item.description || '概要欄なし').replace(/\n/g, '<br>'); // 改行を反映
            const commentCount = item.statistics?.commentCount || '0';
            const likeCount = item.statistics?.likeCount || '0';
            const viewCount = item.statistics?.viewCount || '0';
            const url = item.url || 'https://www.youtube.com/@SuzukaUtako';

            const channelId = item.channelId || 'UCwokZsOK_uEre70XayaFnzA';

            // サムネイル画像のURLを確認し、存在しない場合はプレースホルダー画像を使用
            let thumbnailUrl = item.thumbnails?.high?.url || 'https://via.placeholder.com/480x360?text=No+Image';

            // startAtを日時の表記に変換
            const startAt = item.time?.startAt ? new Date(item.time.startAt).toLocaleString() : '開始日時不明';

            // durationを時分秒に変換
            const duration = item.time?.duration ? convertDuration(item.time.duration) : '0';

            const itemNumber = startIndex + index + 1; // アイテム番号を計算

            // channelIdを基にtitleとurlを取得
            const channelInfo = getChannelInfo(channelId);
            const channelTitle = channelInfo ? channelInfo.title : '不明なチャンネル';
            const channelUrl = channelInfo ? channelInfo.url : '#';

            let deleteClass = '';
            if (deleteID.includes(id)) {
                deleteClass = ' class="delete"';
                thumbnailUrl = './img/noimage.png'; 
            }

            htmlContent += `
            <li${deleteClass}>
			<div class="inner">
			<a href="${url}" target="_blank">
			<div class="img"><img src="${thumbnailUrl}" width="240" height="180" alt="${title}"><p class="time">${duration}</p></div>
			<div class="txt">
				<p class="no">${itemNumber}</p>
				<div class="datech">
					<p class="date">${startAt}</p>
					<p class="ch">${channelTitle}</p>
				</div>
				<h3 class="title">${title}</h3>
				<div class="status">
					<p>視聴回数: <span>${viewCount}</span></p>
					<p>コメント数: <span>${commentCount}</span></p>
					<p>いいね数: <span>${likeCount}</span></p>
				</div>
			</div>
			</a>
            <div class="status--SP">
            <a href="${url}" target="_blank">
                <p>視聴回数<span>${viewCount}</span></p>
                <p>コメント数<span>${commentCount}</span></p>
                <p>いいね数<span>${likeCount}</span></p>
            </a>
            </div>
            <p class="ch--SP"><a href="${channelUrl}" target="_blank">${channelTitle}</a></p>
			<button class="accordion btn">概要欄を表示</button>
			</div>
			<div class="panel">
                <p>${description}</p>
			</div>
            </li$>
            `;
        });
        htmlContent += '</ul>';
        jsonContent.innerHTML = htmlContent;

        // 全体の件数を更新
        totalCountTopElement.textContent = `該当件数: ${dataArray.length}件`;
        totalCountBottomElement.textContent = `該当件数: ${dataArray.length}件`;

        // ページネーションを更新
        updatePagination(dataArray.length);

        // アコーディオンのイベントリスナーを設定
        const accordions = document.querySelectorAll('.accordion');
        accordions.forEach(accordion => {
            accordion.addEventListener('click', function() {
                this.classList.toggle('active');
                const panel = this.parentElement.nextElementSibling;
                if (panel.style.display === 'block') {
                    panel.style.display = 'none';
                } else {
                    panel.style.display = 'block';
                }
            });
        });
    }

    // ページング時にページ上部にスクロールする関数
    function scrollToTop() {
        totalCountTopElement.scrollIntoView();
    }

    // 継続時間を時分秒に変換する関数
    function convertDuration(durationInSeconds) {
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = durationInSeconds % 60;
        
        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else if (minutes > 0) {
            return `${minutes}:${String(seconds).padStart(2, '0')}`;
        } else {
            return `0:${String(seconds).padStart(2, '0')}`;
        }
    }

    // 現在のソート基準と順序を表示する関数
    function updateCurrentSortDisplay() {
        const sortOrder = isAscending ? '昇順' : '降順';
        const sortCriteriaText = {
            startAt: '日付',
            viewCount: '視聴回数',
            duration: '再生時間',
            likeCount: 'いいね数',
            commentCount: 'コメント数'
        }[currentSortCriteria];
        currentSortElement.textContent = `現在の並び順： ${sortCriteriaText} (${sortOrder})`;
    }

    // ページネーションを更新する関数
    function updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        let paginationContent = '';

        paginationContent += `<button class="prev${currentPage === 1 ? ' disabled' : ''}" ${currentPage === 1 ? 'disabled' : ''}>前へ</button>`;

        for (let i = 1; i <= totalPages; i++) {
            paginationContent += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        paginationContent += `<button class="next${currentPage === totalPages ? ' disabled' : ''}" ${currentPage === totalPages ? 'disabled' : ''}>次へ</button>`;

        paginationElement.innerHTML = paginationContent;

        // ページネーションボタンのイベントリスナーを設定
        const pageButtons = paginationElement.querySelectorAll('button[data-page]');
        pageButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentPage = parseInt(button.getAttribute('data-page'));
                sortAndDisplay(currentSortCriteria, false);
                scrollToTop(); // ページ上部にスクロール
            });
        });

        // 前に戻る・次に進むボタンのイベントリスナーを設定
        const prevButton = paginationElement.querySelector('.prev');
        const nextButton = paginationElement.querySelector('.next');

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    sortAndDisplay(currentSortCriteria, false);
                    scrollToTop(); // ページ上部にスクロール
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    sortAndDisplay(currentSortCriteria, false);
                    scrollToTop(); // ページ上部にスクロール
                }
            });
        }

        // ページ情報を更新
        const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
        const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
        const pageInfoText = `全${totalPages}ページ中${currentPage}ページ目（ ${startItem}件目 〜 ${endItem}件目を表示 ）`;

        pageInfoTopElement.textContent = pageInfoText;
        pageInfoBottomElement.textContent = pageInfoText;

        // ページジャンプ用のプルダウンメニューを更新
        updatePageSelect(totalPages);

        // チェックボックスが全て外れている場合、次のページのボタンとpage-selectを非活性にする
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const anyChecked = Array.from(checkboxes).some(cb => cb.checked);

        if (!anyChecked) {
            const nextButton = paginationElement.querySelector('.next');
            if (nextButton) {
                nextButton.disabled = true;
            }
            pageSelectElement.disabled = true;
        } else {
            pageSelectElement.disabled = false;
        }
    }

    // ページジャンプ用のプルダウンメニューを更新する関数
    function updatePageSelect(totalPages) {
        let pageSelectContent = '';

        for (let i = 1; i <= totalPages; i++) {
            pageSelectContent += `<option value="${i}" ${i === currentPage ? 'selected' : ''}>${i}</option>`;
        }

        pageSelectElement.innerHTML = pageSelectContent;

        // ページジャンプのイベントリスナーを設定
        pageSelectElement.addEventListener('change', () => {
            currentPage = parseInt(pageSelectElement.value);
            sortAndDisplay(currentSortCriteria, false);
            scrollToTop(); // ページ上部にスクロール
        });
    }

    // ソートボタンのイベントリスナーを設定
    controls.addEventListener('click', (event) => {
        const sortCriteria = event.target.getAttribute('data-sort');
        if (sortCriteria) {
            currentSortCriteria = sortCriteria;
            sortAndDisplay(currentSortCriteria);

            // ソートボタンの色を更新
            const sortButtons = document.querySelectorAll('#sort button');
            sortButtons.forEach(button => {
                if (button.getAttribute('data-sort') === sortCriteria) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }
    });

    // 昇順・降順の切り替えプルダウンのイベントリスナーを設定
    orderSelect.addEventListener('change', () => {
        isAscending = orderSelect.value === 'asc';
        sortAndDisplay(currentSortCriteria);
    });

    // チェックボックスのイベントリスナーを設定
    controls.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            sortAndDisplay(currentSortCriteria);
        }
    });

    // 検索ボタンのイベントリスナーを設定
    searchButton.addEventListener('click', () => {
        const searchInputValue = searchInput.value.trim();
        searchWords = searchInputValue.split(/\s+/); // 半角スペースと全角スペースで区切る
        searchType = document.querySelector('input[name="search-type"]:checked').value;
        sortAndDisplay(currentSortCriteria);
    });

    // リセットボタンのイベントリスナーを設定
    resetButton.addEventListener('click', () => {
        searchInput.value = '';
        searchWords = [];
        sortAndDisplay(currentSortCriteria);
    });
    

    const channels = [
        {
            "id" : "UCjlmCrq4TP1I4xguOtJ-31w",
            "title" : "でびでび・でびる",
            "url" : "https:\/\/www.youtube.com\/@debidebidebiru"
        },
        {
            "id" : "UCLhUvJ_wO9hOvv_yYENu4fQ",
            "title" : "Siro Channel",
            "url" : "https:\/\/www.youtube.com\/@cybergirlsiro"
        },
        {
            "id" : "UCM9B5B7NjnO7z6uPXixMa7w",
            "title" : "文化放送V&R",
            "url" : "https:\/\/www.youtube.com\/@vr6843"
        },
        {
            "id" : "UC18PnlH3OFTrFlA8RXh7XOw",
            "title" : "VARKチャンネル",
            "url" : "https:\/\/www.youtube.com\/@vark5890"
        },
        {
            "id" : "UC8NZiqKx6fsDT3AVcMiVFyA",
            "title" : "Tamaki Ch. 犬山たまき \/ 佃煮のりお",
            "url" : "https:\/\/www.youtube.com\/@noripro"
        },
        {
            "id" : "UCXU7YYxy_iQd3ulXyO-zC2w",
            "title" : "伏見ガク【にじさんじ所属】",
            "url" : "https:\/\/www.youtube.com\/@fushimigaku"
        },
        {
            "id" : "UCvmppcdYf4HOv-tFQhHHJMA",
            "title" : "《にじさんじ所属の女神》モイラ",
            "url" : "https:\/\/www.youtube.com\/@moira"
        },
        {
            "id" : "UCt0clH12Xk1-Ej5PXKGfdPA",
            "title" : "♥️♠️物述有栖♦️♣️",
            "url" : "https:\/\/www.youtube.com\/@mononobealice"
        },
        {
            "id" : "UC1zFJrfEKvCixhsjNSb1toQ",
            "title" : "シスター・クレア -SisterClaire-",
            "url" : "https:\/\/www.youtube.com\/@sister_claire"
        },
        {
            "id" : "UCtpB6Bvhs1Um93ziEDACQ8g",
            "title" : "Kazaki Ch. ‐ 森中花咲 ‐",
            "url" : "https:\/\/www.youtube.com\/@morinakakazaki"
        },
        {
            "id" : "UCl1oLKcAq93p-pwKfDGhiYQ",
            "title" : "えま★おうがすと \/ Emma★August【にじさんじ】",
            "url" : "https:\/\/www.youtube.com\/@emmaaugust"
        },
        {
            "id" : "UChKXd7oqD18qiIYBoRIHTlw",
            "title" : "Meloco Kyoran【NIJISANJI EN】",
            "url" : "https:\/\/www.youtube.com\/@melocokyoran"
        },
        {
            "id" : "UCuvk5PilcvDECU7dDZhQiEw",
            "title" : "白雪 巴\/Shirayuki Tomoe",
            "url" : "https:\/\/www.youtube.com\/@shirayukitomoe"
        },
        {
            "id" : "UC1CfXB_kRs3C-zaeTG3oGyg",
            "title" : "HAACHAMA Ch 赤井はあと",
            "url" : "https:\/\/www.youtube.com\/@akaihaato"
        },
        {
            "id" : "UCiLhMk-gmE2zgF7KGVyqvFw",
            "title" : "RK Music",
            "url" : "https:\/\/www.youtube.com\/@rkmusic_inc"
        },
        {
            "id" : "UC085EUmQKG8Tt1gVCP3RmnQ",
            "title" : "room6 LLC.",
            "url" : "https:\/\/www.youtube.com\/@6moor"
        },
        {
            "id" : "UC8_LSK-WqO_GyH6iPlbdatQ",
            "title" : "日テレ×VTuber【公式】",
            "url" : "https:\/\/www.youtube.com\/@clan_vtuber"
        },
        {
            "id" : "UCt30jJgChL8qeT9VPadidSw",
            "title" : "しぐれうい",
            "url" : "https:\/\/www.youtube.com\/@ui_shig"
        },
        {
            "id" : "UCuycJ_IsA5ESbTYhe05ozqQ",
            "title" : "レグルシュ・ライオンハートReglush Lionheart",
            "url" : "https:\/\/www.youtube.com\/@reglushlionheart"
        },
        {
            "id" : "UCsFn_ueskBkMCEyzCEqAOvg",
            "title" : "花畑チャイカ",
            "url" : "https:\/\/www.youtube.com\/@hanabatakechaika"
        },
        {
            "id" : "UCD-miitqNY3nyukJ4Fnf4_A",
            "title" : "月ノ美兎",
            "url" : "https:\/\/www.youtube.com\/@tsukinomito"
        },
        {
            "id" : "UCPvGypSgfDkVe7JG2KygK7A",
            "title" : "竜胆 尊 \/ Rindou Mikoto",
            "url" : "https:\/\/www.youtube.com\/@rindoumikoto"
        },
        {
            "id" : "UCqXvL55GYHtRZhBS03LVGnQ",
            "title" : "楪 帆波-Yuzuriha Honami-",
            "url" : "https:\/\/www.youtube.com\/@yuzuriha_honami"
        },
        {
            "id" : "UC53UDnhAAYwvNO7j_2Ju1cQ",
            "title" : "ドーラ",
            "url" : "https:\/\/www.youtube.com\/@dola"
        },
        {
            "id" : "UC9V3Y3_uzU5e-usObb6IE1w",
            "title" : "星川サラ \/ Sara Hoshikawa",
            "url" : "https:\/\/www.youtube.com\/@hoshikawasara"
        },
        {
            "id" : "UCwrjITPwG4q71HzihV2C7Nw",
            "title" : "フミ\/にじさんじ",
            "url" : "https:\/\/www.youtube.com\/@fumi"
        },
        {
            "id" : "UC0Owc36U9lOyi9Gx9Ic-4qg",
            "title" : "Haneru Channel \/ 因幡はねる 【ななしいんく】",
            "url" : "https:\/\/www.youtube.com\/@inaba_haneru"
        },
        {
            "id" : "UCb5JxV6vKlYVknoJB8TnyYg",
            "title" : "黛 灰 \/ Kai Mayuzumi【にじさんじ】",
            "url" : "https:\/\/www.youtube.com\/@mayuzumikai"
        },
        {
            "id" : "UC1suqwovbL1kzsoaZgFZLKg",
            "title" : "Choco Ch. 癒月ちょこ",
            "url" : "https:\/\/www.youtube.com\/@yuzukichoco"
        },
        {
            "id" : "UCtnO2N4kPTXmyvedjGWdx3Q",
            "title" : "レヴィ・エリファ-Levi Elipha-",
            "url" : "https:\/\/www.youtube.com\/@levielipha"
        },
        {
            "id" : "UC48jH1ul-6HOrcSSfoR02fQ",
            "title" : "Yuhi Riri Official",
            "url" : "https:\/\/www.youtube.com\/@yuhiriri"
        },
        {
            "id" : "UCcDDxnoQcezyTUzHg5uHaKg",
            "title" : "四季凪アキラ \/ Shikinagi Akira",
            "url" : "https:\/\/www.youtube.com\/@shikinagiakira"
        },
        {
            "id" : "UCsg-YqdqQ-KFF0LNk23BY4A",
            "title" : "樋口楓【にじさんじ所属】",
            "url" : "https:\/\/www.youtube.com\/@higuchikaede"
        },
        {
            "id" : "UC1QgXt46-GEvtNjEC1paHnw",
            "title" : "グウェル・オス・ガール \/ Gwelu Os Gar 【にじさんじ】",
            "url" : "https:\/\/www.youtube.com\/@gweluosgar"
        },
        {
            "id" : "UC_GCs6GARLxEHxy1w40d6VQ",
            "title" : "家長むぎ【にじさんじ所属】",
            "url" : "https:\/\/www.youtube.com\/@ienagamugi"
        },
        {
            "id" : "UCwokZsOK_uEre70XayaFnzA",
            "title" : "鈴鹿詩子 Utako Suzuka",
            "url" : "https:\/\/www.youtube.com\/@suzukautako"
        },
        {
            "id" : "UCAZ_LA7f0sjuZ1Ni8L2uITw",
            "title" : "どっとライブ",
            "url" : "https:\/\/www.youtube.com\/@_dotlive"
        },
        {
            "id" : "UCryOPk2GZ1meIDt53tL30Tw",
            "title" : "鈴木勝 \/ Suzuki Masaru【にじさんじ】",
            "url" : "https:\/\/www.youtube.com\/@suzukimasaru"
        },
        {
            "id" : "UCZ1xuCK1kNmn5RzPYIZop3w",
            "title" : "リゼ・ヘルエスタ -Lize Helesta-",
            "url" : "https:\/\/www.youtube.com\/@lizehelesta"
        },
        {
            "id" : "UCX7YkU9nEeaoZbkVLVajcMg",
            "title" : "にじさんじ",
            "url" : "https:\/\/www.youtube.com\/@nijisanji"
        },
        {
            "id" : "UC6TfqY40Xt1Y0J-N18c85qQ",
            "title" : "安土桃",
            "url" : "https:\/\/www.youtube.com\/@azuchimomo"
        },
        {
            "id" : "UCT1AQFit-Eaj_YQMsfV0RhQ",
            "title" : "銀河アリスの地球侵略ch.",
            "url" : "https:\/\/www.youtube.com\/@gingaalice"
        },
        {
            "id" : "UCBiqkFJljoxAj10SoP2w2Cg",
            "title" : "文野環【にじさんじの野良猫】ふみのたまき",
            "url" : "https:\/\/www.youtube.com\/@fuminotamaki"
        },
        {
            "id" : "UC1EB8moGYdkoZQfWHjh7Ivw",
            "title" : "ぽんぽこちゃんねる",
            "url" : "https:\/\/www.youtube.com\/@pokopea"
        },
        {
            "id" : "UCfM_A7lE6LkGrzx6_mOtI4g",
            "title" : "雪汝*setsuna channel",
            "url" : "https:\/\/www.youtube.com\/@setsunachannel3198"
        },
        {
            "id" : "UCv1fFr156jc65EMiLbaLImw",
            "title" : "剣持刀也",
            "url" : "https:\/\/www.youtube.com\/@kenmochitoya"
        },
        {
            "id" : "UCeLzT-7b2PBcunJplmWtoDg",
            "title" : "Patra Channel \/ 周防パトラ",
            "url" : "https:\/\/www.youtube.com\/@patra_suou"
        },
        {
            "id" : "UCzuEc7Nsm9GtMX4yuzjSqgA",
            "title" : "謎解き戦士 ガリベンガーV",
            "url" : "https:\/\/www.youtube.com\/@garibenv"
        },
        {
            "id" : "UC0g1AE0DOjBYnLhkgoRWN1w",
            "title" : "本間ひまわり - Himawari Honma -",
            "url" : "https:\/\/www.youtube.com\/@honmahimawari"
        },
        {
            "id" : "UC_T8F2CvqZOwa2kme0WwRhg",
            "title" : "にじさんじ公式切り抜きチャンネル【NIJISANJI Official Best Moments】",
            "url" : "https:\/\/www.youtube.com\/@nijisanji_kirinuki"
        },
        {
            "id" : "UCHVXbQzkl3rDfsXWo8xi2qw",
            "title" : "アンジュ・カトリーナ - Ange Katrina -",
            "url" : "https:\/\/www.youtube.com\/@angekatrina"
        },
        {
            "id" : "UCIG9rDtgR45VCZmYnd-4DUw",
            "title" : "ラトナ・プティ -Ratna Petit -にじさんじ所属",
            "url" : "https:\/\/www.youtube.com\/@ratnapetit"
        },
        {
            "id" : "UC2OacIzd2UxGHRGhdHl1Rhw",
            "title" : "早瀬 走 \/ Hayase Sou【にじさんじ所属】",
            "url" : "https:\/\/www.youtube.com\/@hayasesou"
        },
        {
            "id" : "UCRm6lqtdxs_Qo6HeL-SRQ-w",
            "title" : "レイン・パターソン／Lain Paterson【にじさんじ】",
            "url" : "https:\/\/www.youtube.com\/@lainpaterson"
        },
        {
            "id" : "UCJubINhCcFXlsBwnHp0wl_g",
            "title" : "舞元啓介",
            "url" : "https:\/\/www.youtube.com\/@maimotokeisuke"
        },
        {
            "id" : "UCt5-0i4AVHXaWJrL8Wql3mw",
            "title" : "緑仙 \/ Ryushen",
            "url" : "https:\/\/www.youtube.com\/@ryushen"
        },
        {
            "id" : "UCmUjjW5zF1MMOhYUwwwQv9Q",
            "title" : "宇志海いちご",
            "url" : "https:\/\/www.youtube.com\/@ushimiichigo"
        },
        {
            "id" : "UC2Rr7mILebYLTjd38DNNUTw",
            "title" : "Fairys Channel",
            "url" : "https:\/\/www.youtube.com\/@fairyschannel"
        },
        {
            "id" : "UCV5ZZlLjk5MKGg3L0n0vbzw",
            "title" : "鷹宮リオン \/ Rion Takamiya",
            "url" : "https:\/\/www.youtube.com\/@takamiyarion"
        },
        {
            "id" : "UCYKP16oMX9KKPbrNgo_Kgag",
            "title" : "える \/ Elu【にじさんじ】",
            "url" : "https:\/\/www.youtube.com\/@elu"
        }
    ];

    // channelIdを基にtitleとurlを取得する関数
    function getChannelInfo(channelId) {
        return channels.find(channel => channel.id === channelId);
    }
});