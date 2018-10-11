/**
 * A component which helps in navigation
 * Constructor function.
 */
class SideBar extends H5P.EventDispatcher {
  constructor(config, contentId, parent) {
    super();
    this.id = contentId;
    this.parent = parent;
    this.div = document.createElement('div');
    this.div.classList.add('h5p-digibook-navigation');

    this.chapters = [];


    this.titleElem = this.addMainTitle(config.title);
    this.findAllChapters(config);

    this.chapterElems = this.getChapterElements();



    //Appending phase
    this.div.appendChild(this.titleElem.div);

    this.chapterElems.forEach(element => {
      this.div.appendChild(element);
    });



  }

  addMainTitle(title) {
    const div = document.createElement('div');
    const p = document.createElement('p');

    div.classList.add('h5p-digibook-navigation-maintitle');

    p.innerHTML = title;
    div.appendChild(p);
    return {
      div,
      p
    };
  }

  findAllChapters(config) {
    for (let i = 0; i < config.chapters.length; i++) {
      this.chapters.push(config.chapters[i]);
    }
  }


  editChapterStatus(element, closing) {
    if (closing) {
      element.classList.add('h5p-digibook-navigation-closed');
      const arrow = element.getElementsByClassName('icon-expanded')[0];
      if (arrow) {
        arrow.classList.remove('icon-expanded');
        arrow.classList.add('icon-collapsed');
      }
      
    }
    else {
      element.classList.remove('h5p-digibook-navigation-closed');
      const arrow = element.getElementsByClassName('icon-collapsed')[0];
      if (arrow) {
        arrow.classList.remove('icon-collapsed');
        arrow.classList.add('icon-expanded');
      }
    }
  }
  

  //Fires whenever a redirect is happening in parent
  redirectHandler(newChapter) {
    const elemsClosing = this.chapterElems.filter(x => this.chapterElems.indexOf(x) != newChapter);
    elemsClosing.map(x => this.editChapterStatus(x, true));


    const targetElem = this.chapterElems[newChapter];
    this.editChapterStatus(targetElem, false);
  }



  toggleChapter(element) {
    const x = element.target.parentElement;
    const bool = !(x.classList.contains('h5p-digibook-navigation-closed'));
    this.editChapterStatus(x, bool);
  }

  createElemFromChapter(chapter, chapterIndex) {
    const that = this;

    //Initialize elements
    const chapterDiv = document.createElement('div');
    const sectionsDiv = document.createElement('div');
    const titleDiv = document.createElement('div');
    const title = document.createElement('p');

    //Add classes
    titleDiv.classList.add('h5p-digibook-navigation-chapter-title');
    chapterDiv.classList.add('h5p-digibook-navigation-chapter', 'h5p-digibook-navigation-closed');
    sectionsDiv.classList.add('h5p-digibook-navigation-sections');

    
    title.innerHTML = chapter.chapter_title;
    const arrowIcon = document.createElement('span');
    const circleIcon = document.createElement('span');

    arrowIcon.classList.add('icon-collapsed');
    circleIcon.classList.add('icon-chapter-blank');



    titleDiv.appendChild(arrowIcon);
    titleDiv.appendChild(title);
    titleDiv.appendChild(circleIcon);

    chapterDiv.appendChild(titleDiv);

    titleDiv.onclick = (event) => {
      this.toggleChapter(event);
    };

    // Add sections to the chapter
    const sections = chapter.chapter.params.content;
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      const singleSection = document.createElement('div');
      const p = document.createElement('p');
      singleSection.classList.add('h5p-digibook-navigation-sections-single');
      p.innerHTML = this.parseLibrary(section.content);

      singleSection.appendChild(p);
      
      sectionsDiv.appendChild(singleSection);
      
      singleSection.onclick = () => {
        that.parent.trigger('newChapter', {
          h5pbookid: that.parent.contentId,
          chapter: chapterIndex,
          section: i
        });
      };
    }
    chapterDiv.appendChild(sectionsDiv);

    
    return {
      chapterDiv,
      sectionsDiv,
      sections
    };
  }

  getChapterElements() {
    let tmp = [];
    for (let i = 0; i < this.chapters.length; i++) {
      const chapter = this.chapters[i];      
      const elem = this.createElemFromChapter(chapter, i);
      tmp.push(elem.chapterDiv);
    }
    return tmp;
  }


  /**
   * Parses the library which is used
   * TODO: Implement a more flexible system for library/title detection
   * @param {string} input 
   */
  parseLibrary(input) {
    let tmp;

    switch (input.library.split(" ")[0]) {

      case "H5P.AdvancedText":
        // Finds the first H2-element inside a text-document
        tmp = input.params.text.match(/<h2>(.+)<\/h2>/);
        if (tmp)
          tmp = tmp[1];
        else
          tmp = "Unnamed paragraph";
        break;

      case "H5P.Image":
        tmp = input.params.alt;
        break;
      default:
        tmp = input.library;
        break;
    }
    return tmp;
  }
}
export default SideBar;