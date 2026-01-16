import React, { createContext, useState, useContext, useCallback } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  View, 
  FlatList, 
  Text, 
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ScrollView,
  Animated,
  PanResponder
} from 'react-native';

// Create the context
const ExpenseContext = createContext();

// Custom hook to use the expense context
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

// Theme context
const ThemeContext = createContext();

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Theme Provider
const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? {
      background: '#121212',
      card: '#1E1E1E',
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      primary: '#BB86FC',
      secondary: '#03DAC6',
      error: '#CF6679',
      border: '#333333',
      inputBackground: '#2D2D2D',
      swipeDelete: '#CF6679',
      categoryColors: {
        Food: '#4CAF50',
        Transportation: '#2196F3',
        Entertainment: '#FF9800',
        Shopping: '#E91E63',
        Bills: '#9C27B0',
        Healthcare: '#00BCD4',
        Education: '#795548',
        Other: '#607D8B'
      }
    } : {
      background: '#F5F5F5',
      card: '#FFFFFF',
      text: '#333333',
      textSecondary: '#666666',
      primary: '#2196F3',
      secondary: '#4CAF50',
      error: '#F44336',
      border: '#E0E0E0',
      inputBackground: '#FFFFFF',
      swipeDelete: '#F44336',
      categoryColors: {
        Food: '#4CAF50',
        Transportation: '#2196F3',
        Entertainment: '#FF9800',
        Shopping: '#E91E63',
        Bills: '#9C27B0',
        Healthcare: '#00BCD4',
        Education: '#795548',
        Other: '#607D8B'
      }
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Expense Provider Component
export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([
    {
      id: '1',
      title: 'Groceries',
      amount: 50.75,
      category: 'Food',
      date: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Gasoline',
      amount: 40.00,
      category: 'Transportation',
      date: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Movie Tickets',
      amount: 25.50,
      category: 'Entertainment',
      date: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Electric Bill',
      amount: 80.00,
      category: 'Bills',
      date: new Date().toISOString(),
    },
  ]);

  // Add a new expense
  const addExpense = useCallback((expenseData) => {
    const newExpense = {
      ...expenseData,
      id: Date.now().toString(),
      date: expenseData.date || new Date().toISOString(),
    };
    
    setExpenses((prevExpenses) => [newExpense, ...prevExpenses]);
    return newExpense;
  }, []);

  // Delete an expense
  const deleteExpense = useCallback((id) => {
    setExpenses((prevExpenses) => 
      prevExpenses.filter((expense) => expense.id !== id)
    );
  }, []);

  // Update an existing expense
  const updateExpense = useCallback((id, updatedExpenseData) => {
    setExpenses((prevExpenses) =>
      prevExpenses.map((expense) =>
        expense.id === id
          ? { ...expense, ...updatedExpenseData }
          : expense
      )
    );
  }, []);

  // Calculate total expenses
  const getTotalExpenses = useCallback(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  // Get category totals
  const getCategoryTotals = useCallback(() => {
    const totals = {};
    expenses.forEach(expense => {
      if (!totals[expense.category]) {
        totals[expense.category] = 0;
      }
      totals[expense.category] += expense.amount;
    });
    return totals;
  }, [expenses]);

  const value = {
    expenses,
    addExpense,
    deleteExpense,
    updateExpense,
    getTotalExpenses,
    getCategoryTotals,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

// PHASE 4: Category Filter Component
const CategoryFilter = ({ selectedCategory, onSelectCategory, theme }) => {
  const { expenses, getCategoryTotals } = useExpenses();
  const categoryTotals = getCategoryTotals();
  
  const categories = ['All', 'Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'];
  
  // Count expenses per category
  const getCategoryCount = (category) => {
    if (category === 'All') return expenses.length;
    return expenses.filter(expense => expense.category === category).length;
  };

  return (
    <View style={styles.categoryFilterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilterScroll}
      >
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          const categoryColor = theme.colors.categoryColors[category] || theme.colors.primary;
          const count = getCategoryCount(category);
          
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isActive ? categoryColor : theme.colors.inputBackground,
                  borderColor: isActive ? categoryColor : theme.colors.border
                }
              ]}
              onPress={() => onSelectCategory(category)}
            >
              <Text style={[
                styles.categoryChipText,
                { color: isActive ? '#FFFFFF' : theme.colors.text }
              ]}>
                {category}
              </Text>
              <View style={[
                styles.categoryCountBadge,
                { 
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.3)' : categoryColor + '30'
                }
              ]}>
                <Text style={[
                  styles.categoryCountText,
                  { color: isActive ? '#FFFFFF' : categoryColor }
                ]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// PHASE 3: Swipeable Expense Item Component
const SwipeableExpenseItem = ({ item, onEdit, theme }) => {
  const { deleteExpense } = useExpenses();
  const pan = React.useRef(new Animated.ValueXY()).current;
  const [showDelete, setShowDelete] = useState(false);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          pan.x.setValue(gestureState.dx);
          setShowDelete(true);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -100) {
          Animated.spring(pan.x, {
            toValue: -120,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(pan.x, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
          setShowDelete(false);
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Animated.timing(pan.x, {
      toValue: -500,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      deleteExpense(item.id);
    });
  };

  const handleReset = () => {
    Animated.spring(pan.x, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
    setShowDelete(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const categoryColor = theme.colors.categoryColors[item.category] || theme.colors.primary;

  return (
    <View style={styles.swipeableContainer}>
      {/* Delete Button (hidden behind) */}
      {showDelete && (
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.colors.swipeDelete }]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}

      {/* Expense Item (swipeable) */}
      <Animated.View
        style={[
          styles.expenseItemWrapper,
          { transform: [{ translateX: pan.x }] }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.expenseItem, { backgroundColor: theme.colors.card }]}
          onPress={() => onEdit(item)}
          onLongPress={handleReset}
          activeOpacity={0.7}
        >
          {/* Category Color Indicator */}
          <View 
            style={[
              styles.categoryIndicator, 
              { backgroundColor: categoryColor + '40' }
            ]}
          >
            <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
          </View>

          <View style={styles.expenseContent}>
            <View style={styles.expenseHeader}>
              <Text style={[styles.expenseTitle, { color: theme.colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.expenseAmount, { color: theme.colors.primary }]}>
                ${item.amount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.expenseFooter}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
                <Text style={[styles.categoryText, { color: categoryColor }]}>
                  {item.category}
                </Text>
              </View>
              <Text style={[styles.expenseDate, { color: theme.colors.textSecondary }]}>
                {formatDate(item.date)}
              </Text>
            </View>
          </View>

          {/* Edit Icon */}
          <View style={styles.editIconContainer}>
            <Text style={[styles.editIcon, { color: theme.colors.textSecondary }]}>
              ›
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// PHASE 3 & 4: Expense List Component with Filtering
const ExpenseList = ({ onEditExpense, theme }) => {
  const { expenses, getTotalExpenses, getCategoryTotals } = useExpenses();
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Filter expenses based on selected category
  const filteredExpenses = selectedCategory === 'All' 
    ? expenses 
    : expenses.filter(expense => expense.category === selectedCategory);
  
  // Calculate filtered total
  const filteredTotal = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  
  const categoryTotals = getCategoryTotals();

  const renderCategorySummary = () => {
    const categories = Object.keys(categoryTotals);
    if (categories.length === 0) return null;

    return (
      <View style={styles.categorySummary}>
        <Text style={[styles.categorySummaryTitle, { color: theme.colors.text }]}>
          Spending by Category
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categorySummaryList}
        >
          {categories.map((category) => (
            <View 
              key={category} 
              style={[
                styles.categorySummaryItem, 
                { backgroundColor: theme.colors.categoryColors[category] + '20' }
              ]}
            >
              <Text style={[styles.categorySummaryName, { 
                color: theme.colors.categoryColors[category] 
              }]}>
                {category}
              </Text>
              <Text style={[styles.categorySummaryAmount, { 
                color: theme.colors.text 
              }]}>
                ${categoryTotals[category].toFixed(2)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.expenseListContainer}>
      {/* PHASE 4: Category Filter */}
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        theme={theme}
      />

      {/* Category Summary */}
      {renderCategorySummary()}

      {/* Expense List */}
      <FlatList
        data={filteredExpenses}
        renderItem={({ item }) => (
          <SwipeableExpenseItem 
            item={item} 
            onEdit={onEditExpense}
            theme={theme}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={[styles.emptyListText, { color: theme.colors.textSecondary }]}>
              {selectedCategory === 'All' 
                ? 'No expenses yet. Add your first expense!' 
                : `No expenses in ${selectedCategory} category.`}
            </Text>
            {selectedCategory !== 'All' && (
              <TouchableOpacity
                style={[styles.resetFilterButton, { backgroundColor: theme.colors.primary + '20' }]}
                onPress={() => setSelectedCategory('All')}
              >
                <Text style={[styles.resetFilterText, { color: theme.colors.primary }]}>
                  Show All Expenses
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={[
          styles.listContentContainer,
          filteredExpenses.length === 0 && { flexGrow: 1, justifyContent: 'center' }
        ]}
      />

      {/* Total Footer - shows filtered total */}
      <View style={[styles.totalFooter, { backgroundColor: theme.colors.card }]}>
        <View>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
            {selectedCategory === 'All' ? 'Total Expenses' : `${selectedCategory} Total`}
          </Text>
          {selectedCategory !== 'All' && (
            <Text style={[styles.filteredCount, { color: theme.colors.textSecondary }]}>
              {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
          ${filteredTotal.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

// Expense Form Modal Component (Reusable for both Add and Edit)
const ExpenseFormModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  theme, 
  mode = 'add', // 'add' or 'edit'
  initialData = null 
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [category, setCategory] = useState(initialData?.category || 'Food');
  const [errors, setErrors] = useState({});

  const categories = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'];

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        title: title.trim(),
        amount: parseFloat(amount),
        category,
      });
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('Food');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
    }
  }, [initialData]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {mode === 'edit' ? 'Edit Expense' : 'Add New Expense'}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[styles.closeButton, { color: theme.colors.primary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Expense Title</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.text,
                    borderColor: errors.title ? theme.colors.error : theme.colors.border
                  }
                ]}
                placeholder="Enter expense title"
                placeholderTextColor={theme.colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
              {errors.title && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.title}
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Amount ($)</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.text,
                    borderColor: errors.amount ? theme.colors.error : theme.colors.border
                  }
                ]}
                placeholder="Enter amount"
                placeholderTextColor={theme.colors.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
              {errors.amount && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.amount}
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      { 
                        backgroundColor: category === cat ? theme.colors.categoryColors[cat] || theme.colors.primary : theme.colors.inputBackground,
                        borderColor: theme.colors.border
                      }
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text 
                      style={[
                        styles.categoryButtonText, 
                        { color: category === cat ? '#FFFFFF' : theme.colors.text }
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>
                {mode === 'edit' ? 'Save Changes' : 'Add Expense'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Main App Component
const App = () => {
  return (
    <ThemeProvider>
      <ExpenseProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <ExpenseTracker />
        </SafeAreaView>
      </ExpenseProvider>
    </ThemeProvider>
  );
};

// Component that uses the expense context
const ExpenseTracker = () => {
  const {
    addExpense,
    updateExpense,
    getTotalExpenses,
  } = useExpenses();
  
  const theme = useTheme();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const handleAddExpense = (expenseData) => {
    addExpense(expenseData);
  };

  const handleUpdateExpense = (expenseData) => {
    if (selectedExpense) {
      updateExpense(selectedExpense.id, expenseData);
    }
  };

  const openEditModal = (expense) => {
    setSelectedExpense(expense);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setSelectedExpense(null);
    setIsEditModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Add Expense Modal */}
      <ExpenseFormModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSubmit={handleAddExpense}
        theme={theme}
        mode="add"
      />

      {/* Edit Expense Modal */}
      <ExpenseFormModal
        visible={isEditModalVisible}
        onClose={closeEditModal}
        onSubmit={handleUpdateExpense}
        theme={theme}
        mode="edit"
        initialData={selectedExpense}
      />

      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View>
          <Text style={styles.headerTitle}>Expense Tracker</Text>
          <Text style={styles.totalText}>
            Total: ${getTotalExpenses().toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <View style={styles.themeSwitchContainer}>
            <Text style={styles.themeLabel}>
              {theme.isDarkMode ? '🌙 Dark' : '☀️ Light'}
            </Text>
            <Switch
              value={theme.isDarkMode}
              onValueChange={theme.toggleTheme}
              trackColor={{ false: '#767577', true: theme.colors.secondary }}
              thumbColor={theme.isDarkMode ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.secondary }]}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Add Expense</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PHASE 3 & 4: Expense List Display with Filtering */}
      <ExpenseList 
        onEditExpense={openEditModal}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  totalText: {
    fontSize: 22,
    color: 'white',
    fontWeight: '600',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  themeSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  themeLabel: {
    color: 'white',
    marginRight: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 80,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // PHASE 4: Category Filter Styles
  categoryFilterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  categoryFilterScroll: {
    paddingHorizontal: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  categoryCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryCountText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  // PHASE 3: Expense List Styles
  expenseListContainer: {
    flex: 1,
  },
  categorySummary: {
    padding: 16,
    paddingBottom: 8,
  },
  categorySummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categorySummaryList: {
    marginHorizontal: -4,
  },
  categorySummaryItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
    minWidth: 100,
  },
  categorySummaryName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  categorySummaryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyListText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  resetFilterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetFilterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  filteredCount: {
    fontSize: 12,
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Swipeable Expense Item Styles
  swipeableContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expenseItemWrapper: {
    width: '100%',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  expenseContent: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expenseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expenseDate: {
    fontSize: 12,
  },
  editIconContainer: {
    marginLeft: 8,
  },
  editIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  categoryContainer: {
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;