const fs = require('fs');
let content = fs.readFileSync('src/pages/Vehicles.jsx', 'utf8');
const startMatch = '  const filteredVehicles = displayVehicles.filter(v => {';
const endMatch = '  const handleBulkExport = async () => {';
const startIndex = content.indexOf(startMatch);
const endIndex = content.indexOf(endMatch);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `  const filteredVehicles = displayVehicles.filter(v => {
    const q = searchTerm.toLowerCase();

    // 1. Search Query Match
    const matchesSearch = (
      v.name?.toLowerCase().includes(q) ||
      v.plate?.toLowerCase().includes(q) ||
      (v.imei && String(v.imei).toLowerCase().includes(q)) ||
      v.assignedUser?.toLowerCase().includes(q) ||
      v.assignedUserEmail?.toLowerCase().includes(q)
    );

    // 2. Model Match
    const matchesModel = modelFilter === 'All' || v.name?.toLowerCase().includes(modelFilter.toLowerCase());

    // 3. Fuel Match
    const matchesFuel = fuelFilter === 'All' || v.fuelType?.toLowerCase() === fuelFilter.toLowerCase();

    // 4. Status Match
    const matchesStatus = statusFilter === 'All' || v.statusText?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesModel && matchesFuel && matchesStatus;
  });

  const totalItems = filteredVehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (pageNo) => {
    if (pageNo >= 1 && pageNo <= totalPages) {
      setCurrentPage(pageNo);
      setSelectedVehicles([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedVehicles.length === currentVehicles.length) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles(currentVehicles.map(v => v._id));
    }
  };

`;
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('src/pages/Vehicles.jsx', content);
  console.log('Fixed successfully');
} else {
  console.log('Indices not found', startIndex, endIndex);
}
