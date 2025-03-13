using InventoryService as service from '../../srv/inventory-service';

// Annotations for the Order entity
annotate service.Order with @(
    UI.HeaderInfo : {
        $Type : 'UI.HeaderInfoType',
        TypeName : 'Order',
        TypeNamePlural : 'Orders',
        Title : {
            $Type : 'UI.DataField',
            Value : Company.Name
        },
        Description : {
            $Type : 'UI.DataField',
            Value : OrderDate
        }
    },
    
    // Field group for basic order information
    UI.FieldGroup #GeneralInformation : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Order ID',
                Value : ID
            },
            {
                $Type : 'UI.DataField',
                Label : 'Order Date',
                Value : OrderDate
            },
            {
                $Type : 'UI.DataField',
                Label : 'Company',
                Value : Company_ID
            }
        ]
    },
    
    // Line items for the Order list view
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Order ID',
            Value : ID
        },
        {
            $Type : 'UI.DataField',
            Label : 'Order Date',
            Value : OrderDate
        },
        {
            $Type : 'UI.DataField',
            Label : 'Company',
            Value : Company_ID
        }
    ],
    
    // Facets for the Order detail view
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneralInformationFacet',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneralInformation'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'ItemsFacet',
            Label : 'Order Items',
            Target : 'Items/@UI.LineItem'
        }
    ],
    
    // Selection fields for filtering
    UI.SelectionFields : [
        OrderDate,
        Company_ID
    ]
);

// Value help for Company - Fixed to ensure proper display
annotate service.Company with @(
    UI.Identification : [{
        $Type : 'UI.DataField',
        Value : Name
    }]
);

annotate service.Order with {
    Company @(
        Common.Text : {
            $value : Company.Name,
            ![@UI.TextArrangement] : #TextOnly
        },
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Company',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : Company_ID,
                    ValueListProperty : 'ID'
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'Name'
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'Address'
                }
            ]
        }
    )
};

// Annotations for OrderItem entity
annotate service.OrderItem with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Product',
            Value : Product_ID
        },
        {
            $Type : 'UI.DataField',
            Label : 'Quantity',
            Value : Quantity
        }
    ],
    
    // Field group for the order item details
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Product',
                Value : Product_ID
            },
            {
                $Type : 'UI.DataField',
                Label : 'Quantity',
                Value : Quantity
            }
        ]
    },
    
    // Facets for the order item detail view
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup'
        }
    ]
);

// Value help for Product in OrderItem - Enhanced for proper display
annotate service.Product with @(
    UI.Identification : [{
        $Type : 'UI.DataField',
        Value : Name
    }]
);

annotate service.OrderItem with {
    Product @(
        Common.Text : {
            $value : Product.Name,
            ![@UI.TextArrangement] : #TextOnly
        },
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Product',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : Product_ID,
                    ValueListProperty : 'ID'
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'Name'
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'Description'
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'Price'
                }
            ]
        }
    )
};