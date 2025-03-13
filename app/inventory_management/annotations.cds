using InventoryService as service from '../../srv/inventory-service';

annotate service.Product with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Name',
                Value : Name,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Description',
                Value : Description,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Category',
                Value : Category,
            },
            {
                $Type : 'UI.DataField',
                Label : 'UnitPrice',
                Value : UnitPrice,
            },
            {
                $Type : 'UI.DataField',
                Label : 'MinimumStockLevel',
                Value : MinimumStockLevel,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Quantity',
                Value : Quantity,
            },
            {
                $Type : 'UI.DataField',
                Label : 'LastUpdated',
                Value : LastUpdated,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Name',
            Value : Name,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Description',
            Value : Description,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Category',
            Value : Category,
        },
        {
            $Type : 'UI.DataField',
            Label : 'UnitPrice',
            Value : UnitPrice,
        },
        {
            $Type : 'UI.DataField',
            Label : 'MinimumStockLevel',
            Value : MinimumStockLevel,
        },
    ],
    UI.HeaderInfo : {
        TypeName : 'Product',
        TypeNamePlural : 'Products',
        Title : {
            Value : Name,
            $Type : 'UI.DataField',
        },
        Description : {
            Value : Description,
            $Type : 'UI.DataField',
        },
    }
);