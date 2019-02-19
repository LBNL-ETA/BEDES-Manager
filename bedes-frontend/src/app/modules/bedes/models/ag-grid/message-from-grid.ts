import { TableCellMessageType } from './enums/table-cell-message-type.enum';

/**
 * Defines the interface for receiving messages from the ag-grid/table-cell-nav component.
 * @template T The Object used as the ag-grid data source for each row.
 */
export abstract class MessageFromGrid<T> {
    /**
     * The method called from the ag-grid cell `ag-grid/table-cell-nav`.
     * @param messageType The type of message received from the grid. Corresponds to a button click.
     * @param selectedRow The ag-grid row of type T that was clicked.
     */
    public abstract messageFromGrid(messageType: TableCellMessageType, selectedRow: T);
    /**
     * The ag-grid table context must be passed to the ag-grid component in the grid markup in the html template.
     *
     * The table context is required for the grid to communicate with the host component.
     *
     * @example
     * <ag-grid-angular
     *   [gridOptions]="gridOptions"
     *   [context]="tableContext">
     * </ag-grid-angular>
     */
    public abstract tableContext: any;
    /**
     * Set the execution context for the table.  Used for cell renderers
     * to be able to access the parent component methods.
     */
    protected setTableContext(): void {
        this.tableContext = {
            parent: this
        };
    }
}
