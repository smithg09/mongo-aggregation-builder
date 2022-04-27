/**
 * Lookup Variable List Interface
 */
export interface LookupVariableListInterface {
    /**
     * The variable name to be used in $let.
     */
    var: string,
    /**
     * Source variable for assignment.
     */
    source: string,
    /**
     * Decides whether to add match stage in nested pipeline if key primary.
     */
    key?: 'primary' | 'secondary',
    /**
     * To Overide Equals variable in nested pipline.
     */
    overideEqualsVar?: string,
}