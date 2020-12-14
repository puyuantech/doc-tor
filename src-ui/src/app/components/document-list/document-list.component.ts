import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SavedViewConfig } from 'src/app/data/saved-view-config';
import { DocumentListViewService } from 'src/app/services/document-list-view.service';
import { DOCUMENT_SORT_FIELDS } from 'src/app/services/rest/document.service';
import { SavedViewConfigService } from 'src/app/services/saved-view-config.service';
import { Toast, ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
import { FilterEditorComponent } from '../filter-editor/filter-editor.component';
import { SaveViewConfigDialogComponent } from './save-view-config-dialog/save-view-config-dialog.component';
@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit {

  constructor(
    public list: DocumentListViewService,
    public savedViewConfigService: SavedViewConfigService,
    public route: ActivatedRoute,
    private toastService: ToastService,
    public modalService: NgbModal,
    private titleService: Title) { }

  @ViewChild("filterEditor")
  private filterEditor: FilterEditorComponent

  displayMode = 'smallCards' // largeCards, smallCards, details

  get isFiltered() {
    return this.list.filterRules?.length > 0
  }

  getTitle() {
    return this.list.savedViewTitle || "Documents"
  }

  getSortFields() {
    return DOCUMENT_SORT_FIELDS
  }

  saveDisplayMode() {
    localStorage.setItem('document-list:displayMode', this.displayMode)
  }

  ngOnInit(): void {
    if (localStorage.getItem('document-list:displayMode') != null) {
      this.displayMode = localStorage.getItem('document-list:displayMode')
    }
    this.route.paramMap.subscribe(params => {
      if (params.has('id')) {
        this.list.savedView = this.savedViewConfigService.getConfig(params.get('id'))
        this.titleService.setTitle(`${this.list.savedView.title} - ${environment.appTitle}`)
      } else {
        this.list.savedView = null
        this.titleService.setTitle(`Documents - ${environment.appTitle}`)
      }
      this.list.clear()
      this.list.reload()
    })
  }


  loadViewConfig(config: SavedViewConfig) {
    this.list.load(config)
  }

  saveViewConfig() {
    this.savedViewConfigService.updateConfig(this.list.savedView)
    this.toastService.showToast(Toast.make("Information", `View "${this.list.savedView.title}" saved successfully.`))
  }

  saveViewConfigAs() {
    let modal = this.modalService.open(SaveViewConfigDialogComponent, {backdrop: 'static'})
    modal.componentInstance.saveClicked.subscribe(formValue => {
      this.savedViewConfigService.newConfig({
        title: formValue.title,
        showInDashboard: formValue.showInDashboard,
        showInSideBar: formValue.showInSideBar,
        filterRules: this.list.filterRules,
        sortDirection: this.list.sortDirection,
        sortField: this.list.sortField
      })
      modal.close()
    })
  }

  clickTag(tagID: number) {
    this.filterEditor.toggleTag(tagID)
  }

  clickCorrespondent(correspondentID: number) {
    this.filterEditor.toggleCorrespondent(correspondentID)
  }

  clickDocumentType(documentTypeID: number) {
    this.filterEditor.toggleDocumentType(documentTypeID)
  }

}
