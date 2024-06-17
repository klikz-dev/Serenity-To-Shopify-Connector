export const generateTags = async (akeneoProduct) => {
  const mergedProductsArray = [];

  const productAttributes = {
    categories: akeneoProduct?.categories,
    product_type: akeneoProduct?.values?.product_type,
    box_width: akeneoProduct?.values?.box_width,
    box_height: akeneoProduct?.values?.box_height,
    box_length: akeneoProduct?.values?.box_length,
    requires_fitment: akeneoProduct?.values?.requires_fitment,
  };

  const productTagsArray =
    await createTagsFromProductAttributes(productAttributes);
  mergedProductsArray.push(productTagsArray);

  if (akeneoProduct.values?.zn_fitment) {
    createTagsFromFitment(
      akeneoProduct.values.zn_fitment[0].data,
      mergedProductsArray,
      akeneoProduct.identifier,
    );
  }

  if (akeneoProduct.values?.fitment) {
    createTagsFromFitment(
      akeneoProduct.values.fitment[0].data,
      mergedProductsArray,
      akeneoProduct.identifier,
    );
  }

  const flattenedAndFilteredArray = [
    ...new Set(
      mergedProductsArray
        .flat()
        .filter((item) => item !== '*' && item !== 'undefined')
        ?.map((data) => data?.toString()),
    ),
  ];
  return flattenedAndFilteredArray;
};

async function createTagsFromProductAttributes(productAttributes) {
  const productTagsArray = [];
  for (const [key, attribute] of Object.entries(productAttributes)) {
    if (!attribute || !attribute[0] || attribute[0]?.data === null) continue;

    switch (key) {
      case 'box_width':
      case 'box_height':
      case 'box_length':
        const amount = attribute[0]?.data[0]?.amount;
        if (amount != null) {
          productTagsArray.push(amount);
        }
        break;

      case 'categories':
        for (const category of attribute) {
          const label = await makeRequest(
            'GET',
            `${process.env.AKENEO_API_URI}categories/${category}`,
            null,
            null,
            null,
          );
          if (label.labels?.en_US) {
            productTagsArray.push(label.labels.en_US);
          }
        }
        break;

      default:
        const value = attribute[0]?.data?.toString();
        productTagsArray.push(`${key.replace(/_/g, ' ')}:${value}`);
    }
  }
  return productTagsArray;
}

function createTagsFromFitment(
  productFitmentString,
  mergedProductsArray,
  identifier,
) {
  const fitmentStringArr = productFitmentString.split(';');
  const fitmentTagsArray = [];
  const fitmentYearsArray = [];
  let productRecordExists = false;

  fitmentStringArr.forEach((string) => {
    const tempTags = string.split('|');
    tempTags.forEach((tag, j) => {
      if (
        tag !== 'X' &&
        !fitmentTagsArray.includes(tag) &&
        isNaN(Number(tag))
      ) {
        fitmentTagsArray.push(tag.includes('Ram') ? tag.toUpperCase() : tag);
      } else if (
        tag !== 'X' &&
        !fitmentYearsArray.includes(tag) &&
        !isNaN(Number(tag)) &&
        j === 0
      ) {
        fitmentTagsArray.push(tag);
        fitmentYearsArray.push(tag);
      }
    });
  });

  const yearRange =
    fitmentYearsArray.length > 1
      ? createYearRangeTag(fitmentYearsArray)
      : fitmentYearsArray[0] ?? 'No Year';

  if (!fitmentTagsArray.includes(yearRange)) {
    fitmentTagsArray.push(yearRange);
  }

  mergedProductsArray.some((product) => {
    if (product[identifier]) {
      product[identifier] = [
        ...new Set([...product[identifier], ...fitmentTagsArray]),
      ];
      productRecordExists = true;
      return true;
    }
  });

  if (!productRecordExists) {
    mergedProductsArray.push({ [identifier]: fitmentTagsArray });
  }
}

function createYearRangeTag(years) {
  let range_started = 0;
  const ranges = [];
  const last_year = years[years.length - 1];
  let next_expected = 0;

  years.forEach((year) => {
    year = parseInt(year, 10);
    if (!range_started) {
      range_started = year;
      next_expected = year + 1;
      return;
    }

    if (year === next_expected) {
      next_expected++;
      if (year < last_year) return;
    }

    const ne = next_expected - 1;
    ranges.push(range_started < ne ? `${range_started}-${ne}` : range_started);
    range_started = year;
    next_expected = year + 1;
  });

  ranges.push(
    range_started < last_year ? `${range_started}-${last_year}` : range_started,
  );
  return ranges[0];
}
